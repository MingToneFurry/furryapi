// IP 计算核心的单元测试：固定期望值，外加固定种子的性质检查。
// 运行：node --test src/lib/ipcalc.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import {
  CALC_ERRORS,
  cidrFromMask,
  cidrToMask,
  classBaseBits,
  classful,
  convertIp,
  dottedToBinHex,
  hexToIp,
  hostStats,
  inferClassFromIp,
  invertMask,
  maskConverter,
  maskFromCidr,
  maskHostCount,
  maskToCidr,
  networkNode,
  networkRange,
  parseBinary32,
  parseHex32,
  parseIPv4,
  requiredToMask,
  toBinOctets,
  toHex32,
  toHexOctets,
  toIPv4,
} from './ipcalc.ts';

/** 把点分文本转成数值，格式不对时直接抛错，避免测试里出现类型断言 */
function ipValue(text: string): number {
  const value = parseIPv4(text);
  if (value === null) throw new Error(`bad ip: ${text}`);
  return value;
}

/** 固定种子的伪随机数（mulberry32），保证每次运行的样本一致 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('parseIPv4 接受前导零，拒绝格式错误的地址', () => {
  assert.strictEqual(parseIPv4('10.1.0.1'), 167837697);
  assert.strictEqual(parseIPv4('010.001.000.001'), 167837697);
  assert.strictEqual(parseIPv4(' 192.168.1.1 '), 3232235777);
  for (const bad of ['', '1.2.3', '1.2.3.4.5', '256.0.0.1', '1.2.3.a', '1..2.3', '-1.0.0.1', '1.2.3.4/24', '1 .2.3.4']) {
    assert.strictEqual(parseIPv4(bad), null, bad);
  }
});

test('格式化函数输出固定文本', () => {
  assert.strictEqual(toIPv4(0xc0a80101), '192.168.1.1');
  assert.strictEqual(toBinOctets(0xc0a80101), '11000000.10101000.00000001.00000001');
  assert.strictEqual(toHexOctets(0xc0a80101), 'C0.A8.01.01');
  assert.strictEqual(toHex32(0x0a000001), '0x0A000001');
  assert.strictEqual(toHex32(0), '0x00000000');
});

test('maskFromCidr 处理 /0、/31、/32 与非法位数', () => {
  assert.strictEqual(maskFromCidr(0), 0);
  assert.strictEqual(maskFromCidr(1), 2147483648);
  assert.strictEqual(maskFromCidr(24), 4294967040);
  assert.strictEqual(maskFromCidr(31), 4294967294);
  assert.strictEqual(maskFromCidr(32), 4294967295);
  for (const bad of [-1, 33, 1.5, Number.NaN, Infinity]) {
    assert.strictEqual(maskFromCidr(bad), null, String(bad));
  }
});

test('cidrFromMask 只接受连续掩码', () => {
  assert.strictEqual(cidrFromMask(0), 0);
  assert.strictEqual(cidrFromMask(4294967040), 24);
  assert.strictEqual(cidrFromMask(4294967294), 31);
  assert.strictEqual(cidrFromMask(4294967295), 32);
  assert.strictEqual(cidrFromMask(0xff000001), null);
  assert.strictEqual(cidrFromMask(0xff00ff00), null);
});

test('hostStats 给出 /0、/24、/30、/31、/32 的地址数', () => {
  assert.deepStrictEqual(hostStats(0), { total: 4294967296, usable: 4294967294 });
  assert.deepStrictEqual(hostStats(24), { total: 256, usable: 254 });
  assert.deepStrictEqual(hostStats(30), { total: 4, usable: 2 });
  assert.deepStrictEqual(hostStats(31), { total: 2, usable: 2 });
  assert.deepStrictEqual(hostStats(32), { total: 1, usable: 1 });
});

test('parseHex32 接受 0x 与 . 空白 : - 分隔符', () => {
  for (const text of ['c0a80101', '0xC0A80101', '0XC0A80101', 'C0:A8:01:01', 'c0-a8-01-01', 'c0.a8.01.01', ' c0 a8 01 01 ', ' 0x c0a8 0101 ']) {
    assert.strictEqual(parseHex32(text), 3232235777, text);
  }
  for (const bad of ['c0a8010', 'c0a801011', 'g0a80101', '', '0x', 'c0a8 0x01']) {
    assert.strictEqual(parseHex32(bad), null, bad);
  }
});

test('parseBinary32 只去掉 . 与空白，冒号和短横线视为非法', () => {
  const value = 3232235777;
  assert.strictEqual(parseBinary32('11000000101010000000000100000001'), value);
  assert.strictEqual(parseBinary32('11000000.10101000.00000001.00000001'), value);
  assert.strictEqual(parseBinary32('11000000 10101000 00000001 00000001'), value);
  assert.strictEqual(parseBinary32('11000000:10101000:00000001:00000001'), null);
  assert.strictEqual(parseBinary32('11000000-10101000-00000001-00000001'), null);
  assert.strictEqual(parseBinary32('1100000010101000000000010000000'), null);
});

test('inferClassFromIp 按首字节划分 A/B/C 类边界', () => {
  const cases: [string, string | null][] = [
    ['0.0.0.0', null],
    ['1.0.0.0', 'A'],
    ['126.255.255.255', 'A'],
    ['127.0.0.1', null],
    ['128.0.0.0', 'B'],
    ['191.255.255.255', 'B'],
    ['192.0.0.0', 'C'],
    ['223.255.255.255', 'C'],
    ['224.0.0.0', null],
    ['255.255.255.255', null],
  ];
  for (const [ip, expected] of cases) {
    assert.strictEqual(inferClassFromIp(ipValue(ip)), expected, ip);
  }
});

test('classBaseBits 只认 A/B/C', () => {
  assert.strictEqual(classBaseBits('A'), 8);
  assert.strictEqual(classBaseBits('B'), 16);
  assert.strictEqual(classBaseBits('C'), 24);
  for (const other of ['', 'a', 'D', 'default', 'X']) {
    assert.strictEqual(classBaseBits(other), null, other);
  }
});

test('networkRange：/31 与 /32 的首尾地址等于网络地址和广播地址', () => {
  assert.deepStrictEqual(networkRange('192.168.1.130', '31'), {
    ok: true,
    usable: 2,
    total: 2,
    mask: '255.255.255.254',
    cidr: 31,
    network: '192.168.1.130',
    first: '192.168.1.130',
    last: '192.168.1.131',
    broadcast: '192.168.1.131',
  });
  assert.deepStrictEqual(networkRange('192.168.1.130', '32'), {
    ok: true,
    usable: 1,
    total: 1,
    mask: '255.255.255.255',
    cidr: 32,
    network: '192.168.1.130',
    first: '192.168.1.130',
    last: '192.168.1.130',
    broadcast: '192.168.1.130',
  });
});

test('networkRange：/0 覆盖整个 IPv4 空间', () => {
  assert.deepStrictEqual(networkRange('10.1.2.3', '0'), {
    ok: true,
    usable: 4294967294,
    total: 4294967296,
    mask: '0.0.0.0',
    cidr: 0,
    network: '0.0.0.0',
    first: '0.0.0.1',
    last: '255.255.255.254',
    broadcast: '255.255.255.255',
  });
});

test('networkRange：接受 0x18、1e1、24.0 等 Number 写法', () => {
  assert.deepStrictEqual(networkRange('10.0.0.254', '0x18'), {
    ok: true,
    usable: 254,
    total: 256,
    mask: '255.255.255.0',
    cidr: 24,
    network: '10.0.0.0',
    first: '10.0.0.1',
    last: '10.0.0.254',
    broadcast: '10.0.0.255',
  });
  assert.deepStrictEqual(networkRange('10.0.0.1', '1e1'), {
    ok: true,
    usable: 4194302,
    total: 4194304,
    mask: '255.192.0.0',
    cidr: 10,
    network: '10.0.0.0',
    first: '10.0.0.1',
    last: '10.63.255.254',
    broadcast: '10.63.255.255',
  });
  assert.strictEqual(networkRange('10.0.0.1', ' 24.0 ').ok, true);
});

test('networkRange：CIDR 为空或只有空白时报错，不再当作 /0', () => {
  for (const cidr of ['', ' ', '\t', '\u3000']) {
    assert.deepStrictEqual(networkRange('10.0.0.1', cidr), { ok: false, error: 'NETWORK_RANGE_INVALID' }, JSON.stringify(cidr));
  }
  for (const cidr of ['33', '-1', 'abc', '24.5']) {
    assert.deepStrictEqual(networkRange('10.0.0.1', cidr), { ok: false, error: 'NETWORK_RANGE_INVALID' }, cidr);
  }
  assert.deepStrictEqual(networkRange('bad', '24'), { ok: false, error: 'NETWORK_RANGE_INVALID' });
});

test('networkNode：网络、广播与可用数', () => {
  assert.deepStrictEqual(networkNode('255.255.255.0', '192.168.1.77'), {
    ok: true,
    network: '192.168.1.0',
    usable: 254,
    total: 256,
    broadcast: '192.168.1.255',
  });
  assert.deepStrictEqual(networkNode('255.255.255.255', '10.0.0.1'), {
    ok: true,
    network: '10.0.0.1',
    usable: 1,
    total: 1,
    broadcast: '10.0.0.1',
  });
  assert.deepStrictEqual(networkNode('255.0.255.0', '10.0.0.1'), { ok: false, error: 'NODE_MASK_NOT_CONTIGUOUS' });
  assert.deepStrictEqual(networkNode('255.255.255.0', 'bad'), { ok: false, error: 'NODE_INPUT_INVALID' });
});

test('convertIp：第一个非空输入生效，即使它无效也不回落', () => {
  assert.deepStrictEqual(convertIp({ dotted: 'bad', binary: '1'.repeat(32), hex: '', decimal: '' }), {
    ok: false,
    error: 'CONVERT_INPUT_INVALID',
  });
  assert.deepStrictEqual(
    convertIp({ dotted: '', binary: '11000000101010000000000100000001', hex: 'FFFFFFFF', decimal: '1' }),
    {
      ok: true,
      dotted: '192.168.1.1',
      binary: '11000000.10101000.00000001.00000001',
      hex: '0xC0A80101',
      hexOctets: 'C0.A8.01.01',
      decimal: 3232235777,
    },
  );
  assert.deepStrictEqual(convertIp({ dotted: '', binary: '', hex: '0xC0A80101', decimal: '1' }), {
    ok: true,
    dotted: '192.168.1.1',
    binary: '11000000.10101000.00000001.00000001',
    hex: '0xC0A80101',
    hexOctets: 'C0.A8.01.01',
    decimal: 3232235777,
  });
  assert.deepStrictEqual(convertIp({ dotted: ' 192.168.1.1 ', binary: '', hex: '', decimal: '' }), {
    ok: true,
    dotted: '192.168.1.1',
    binary: '11000000.10101000.00000001.00000001',
    hex: '0xC0A80101',
    hexOctets: 'C0.A8.01.01',
    decimal: 3232235777,
  });
  assert.deepStrictEqual(convertIp({ dotted: '', binary: '', hex: '', decimal: '3232235777' }), {
    ok: true,
    dotted: '192.168.1.1',
    binary: '11000000.10101000.00000001.00000001',
    hex: '0xC0A80101',
    hexOctets: 'C0.A8.01.01',
    decimal: 3232235777,
  });
  assert.deepStrictEqual(convertIp({ dotted: '', binary: '', hex: '', decimal: '' }), {
    ok: false,
    error: 'CONVERT_INPUT_INVALID',
  });
});

test('convertIp：十进制沿用 Number 写法，0x18 与 1e1 有效，越界与小数无效', () => {
  assert.deepStrictEqual(convertIp({ dotted: '', binary: '', hex: '', decimal: '0x18' }), {
    ok: true,
    dotted: '0.0.0.24',
    binary: '00000000.00000000.00000000.00011000',
    hex: '0x00000018',
    hexOctets: '00.00.00.18',
    decimal: 24,
  });
  assert.deepStrictEqual(convertIp({ dotted: '', binary: '', hex: '', decimal: '1e1' }), {
    ok: true,
    dotted: '0.0.0.10',
    binary: '00000000.00000000.00000000.00001010',
    hex: '0x0000000A',
    hexOctets: '00.00.00.0A',
    decimal: 10,
  });
  for (const decimal of ['4294967296', '-1', '2.5', 'abc']) {
    assert.deepStrictEqual(convertIp({ dotted: '', binary: '', hex: '', decimal }), {
      ok: false,
      error: 'CONVERT_INPUT_INVALID',
    }, decimal);
  }
});

test('dottedToBinHex 与 hexToIp 的固定输出', () => {
  assert.deepStrictEqual(dottedToBinHex('192.168.1.1'), {
    ok: true,
    binary: '11000000.10101000.00000001.00000001',
    hex: '0xC0A80101',
    hexOctets: 'C0.A8.01.01',
  });
  assert.deepStrictEqual(dottedToBinHex('192.168.1'), { ok: false, error: 'IPV4_INVALID' });
  assert.deepStrictEqual(hexToIp('0xC0A80101'), {
    ok: true,
    dotted: '192.168.1.1',
    binary: '11000000.10101000.00000001.00000001',
  });
  assert.deepStrictEqual(hexToIp('C0:A8:01:01'), {
    ok: true,
    dotted: '192.168.1.1',
    binary: '11000000.10101000.00000001.00000001',
  });
  assert.deepStrictEqual(hexToIp('0xC0A8'), { ok: false, error: 'HEX32_INVALID' });
});

test('maskToCidr 与 invertMask', () => {
  assert.deepStrictEqual(maskToCidr('255.255.255.0'), { ok: true, cidr: 24 });
  assert.deepStrictEqual(maskToCidr('0.0.0.0'), { ok: true, cidr: 0 });
  assert.deepStrictEqual(maskToCidr('255.0.255.0'), { ok: false, error: 'MASK_NOT_CONTIGUOUS' });
  assert.deepStrictEqual(maskToCidr('abc'), { ok: false, error: 'MASK_INVALID' });
  assert.deepStrictEqual(invertMask('255.255.255.0'), { ok: true, wildcard: '0.0.0.255' });
  assert.deepStrictEqual(invertMask('0.0.0.0'), { ok: true, wildcard: '255.255.255.255' });
  assert.deepStrictEqual(invertMask('bad'), { ok: false, error: 'MASK_INVALID' });
});

test('cidrToMask：/0、/24、/32 的固定输出，空输入报错', () => {
  assert.deepStrictEqual(cidrToMask('0'), {
    ok: true,
    decimal: 0,
    dotted: '0.0.0.0',
    hex: '0x00000000',
    hexOctets: '00.00.00.00',
  });
  assert.deepStrictEqual(cidrToMask('24'), {
    ok: true,
    decimal: 4294967040,
    dotted: '255.255.255.0',
    hex: '0xFFFFFF00',
    hexOctets: 'FF.FF.FF.00',
  });
  assert.deepStrictEqual(cidrToMask('0x18'), {
    ok: true,
    decimal: 4294967040,
    dotted: '255.255.255.0',
    hex: '0xFFFFFF00',
    hexOctets: 'FF.FF.FF.00',
  });
  assert.deepStrictEqual(cidrToMask('32'), {
    ok: true,
    decimal: 4294967295,
    dotted: '255.255.255.255',
    hex: '0xFFFFFFFF',
    hexOctets: 'FF.FF.FF.FF',
  });
  for (const bad of ['', ' ', '33', '-1']) {
    assert.deepStrictEqual(cidrToMask(bad), { ok: false, error: 'CIDR_RANGE' }, JSON.stringify(bad));
  }
});

test('maskHostCount：/0、/31、/32 与空输入报错', () => {
  assert.deepStrictEqual(maskHostCount('0'), { ok: true, usable: 4294967294, total: 4294967296, dotted: '0.0.0.0' });
  assert.deepStrictEqual(maskHostCount('31'), { ok: true, usable: 2, total: 2, dotted: '255.255.255.254' });
  assert.deepStrictEqual(maskHostCount('32'), { ok: true, usable: 1, total: 1, dotted: '255.255.255.255' });
  assert.deepStrictEqual(maskHostCount('24'), { ok: true, usable: 254, total: 256, dotted: '255.255.255.0' });
  assert.deepStrictEqual(maskHostCount(''), { ok: false, error: 'CIDR_RANGE' });
  assert.deepStrictEqual(maskHostCount('\n'), { ok: false, error: 'CIDR_RANGE' });
});

test('requiredToMask：按需要的地址数选出最小网段', () => {
  const table: [string, number, string, number, number][] = [
    ['1', 32, '255.255.255.255', 1, 1],
    ['2', 31, '255.255.255.254', 2, 2],
    ['3', 29, '255.255.255.248', 6, 8],
    ['5', 29, '255.255.255.248', 6, 8],
    ['6', 29, '255.255.255.248', 6, 8],
    ['7', 28, '255.255.255.240', 14, 16],
    ['254', 24, '255.255.255.0', 254, 256],
    ['255', 23, '255.255.254.0', 510, 512],
    ['4294967294', 0, '0.0.0.0', 4294967294, 4294967296],
  ];
  for (const [required, cidr, dotted, usable, total] of table) {
    assert.deepStrictEqual(requiredToMask(required), { ok: true, cidr, dotted, usable, total }, required);
  }
});

test('requiredToMask：0x18 与 1e1 按 Number 解析', () => {
  assert.deepStrictEqual(requiredToMask('0x18'), {
    ok: true,
    cidr: 27,
    dotted: '255.255.255.224',
    usable: 30,
    total: 32,
  });
  assert.deepStrictEqual(requiredToMask('1e1'), {
    ok: true,
    cidr: 28,
    dotted: '255.255.255.240',
    usable: 14,
    total: 16,
  });
});

test('requiredToMask：空、0、负数、小数和非数字都报 REQUIRED_INVALID', () => {
  for (const bad of ['', ' ', '0', '-1', '2.5', 'abc']) {
    assert.deepStrictEqual(requiredToMask(bad), { ok: false, error: 'REQUIRED_INVALID' }, JSON.stringify(bad));
  }
});

test('requiredToMask：超过 IPv4 可用地址数的需求报 REQUIRED_TOO_LARGE', () => {
  assert.deepStrictEqual(requiredToMask('4294967295'), { ok: false, error: 'REQUIRED_TOO_LARGE' });
  assert.deepStrictEqual(requiredToMask('1e20'), { ok: false, error: 'REQUIRED_TOO_LARGE' });
});

test('maskConverter：点分十进制优先，位元数只在点分为空时使用', () => {
  const slash24 = { ok: true, dotted: '255.255.255.0', cidr: 24, hex: '0xFFFFFF00' };
  assert.deepStrictEqual(maskConverter({ dotted: '255.255.255.0', bits: 'abc' }), slash24);
  assert.deepStrictEqual(maskConverter({ dotted: '', bits: '24' }), slash24);
  assert.deepStrictEqual(maskConverter({ dotted: '', bits: '0x18' }), slash24);
  assert.deepStrictEqual(maskConverter({ dotted: '', bits: '0' }), {
    ok: true,
    dotted: '0.0.0.0',
    cidr: 0,
    hex: '0x00000000',
  });
  assert.deepStrictEqual(maskConverter({ dotted: 'bad', bits: '24' }), {
    ok: false,
    error: 'MASK_CONVERTER_DOTTED_INVALID',
  });
  assert.deepStrictEqual(maskConverter({ dotted: '255.0.255.0', bits: '' }), {
    ok: false,
    error: 'MASK_CONVERTER_NOT_CONTIGUOUS',
  });
  assert.deepStrictEqual(maskConverter({ dotted: '', bits: '33' }), { ok: false, error: 'MASK_CONVERTER_BITS_INVALID' });
  assert.deepStrictEqual(maskConverter({ dotted: '', bits: '  ' }), { ok: false, error: 'MASK_CONVERTER_EMPTY' });
  assert.deepStrictEqual(maskConverter({ dotted: ' ', bits: '' }), { ok: false, error: 'MASK_CONVERTER_EMPTY' });
});

test('位数输入为 -0 时结果也是 0，不会显示 -0', () => {
  // Object.is 才能区分 -0 与 0，所以用 deepStrictEqual 整体比较
  assert.deepStrictEqual(networkRange('10.0.0.1', '-0'), {
    ok: true,
    usable: 4294967294,
    total: 4294967296,
    mask: '0.0.0.0',
    cidr: 0,
    network: '0.0.0.0',
    first: '0.0.0.1',
    last: '255.255.255.254',
    broadcast: '255.255.255.255',
  });
  for (const bits of ['-0', '-0.0', '-0e0']) {
    const result = maskConverter({ dotted: '', bits });
    assert.ok(result.ok, bits);
    if (result.ok) assert.ok(Object.is(result.cidr, 0), bits);
  }
});

test('classful：默认按首字节推断 A 类，子网数量优先', () => {
  assert.deepStrictEqual(classful({ ip: '10.1.2.3', netType: 'default', subnets: '4', hosts: '' }), {
    ok: true,
    netType: 'A',
    mask: '255.192.0.0',
    cidr: 10,
    subnetCount: 4,
    hostsPerNetwork: 4194304,
  });
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'A', subnets: '4', hosts: '28' }), {
    ok: true,
    netType: 'A',
    mask: '255.192.0.0',
    cidr: 10,
    subnetCount: 4,
    hostsPerNetwork: 4194304,
  });
});

test('classful：默认推断 C 类后按每网主机数推算', () => {
  assert.deepStrictEqual(classful({ ip: '192.168.1.1', netType: 'default', subnets: '', hosts: '28' }), {
    ok: true,
    netType: 'C',
    mask: '255.255.255.224',
    cidr: 27,
    subnetCount: 8,
    hostsPerNetwork: 32,
  });
});

test('classful：默认推断 B 类，子网数为 2', () => {
  assert.deepStrictEqual(classful({ ip: '172.16.0.1', netType: 'default', subnets: '2', hosts: '' }), {
    ok: true,
    netType: 'B',
    mask: '255.255.128.0',
    cidr: 17,
    subnetCount: 2,
    hostsPerNetwork: 32768,
  });
});

test('classful：手动指定 B 类时忽略首字节推断', () => {
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'B', subnets: '4', hosts: '' }), {
    ok: true,
    netType: 'B',
    mask: '255.255.192.0',
    cidr: 18,
    subnetCount: 4,
    hostsPerNetwork: 16384,
  });
});

test('classful：子网数与主机数的各种回落与错误分支', () => {
  // 子网数不是正整数时回落到每网主机数
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'A', subnets: '0', hosts: '2' }), {
    ok: true,
    netType: 'A',
    mask: '255.255.255.254',
    cidr: 31,
    subnetCount: 8388608,
    hostsPerNetwork: 2,
  });
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'A', subnets: '2.5', hosts: '28' }), {
    ok: true,
    netType: 'A',
    mask: '255.255.255.224',
    cidr: 27,
    subnetCount: 524288,
    hostsPerNetwork: 32,
  });
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'A', subnets: '-1', hosts: '28' }), {
    ok: true,
    netType: 'A',
    mask: '255.255.255.224',
    cidr: 27,
    subnetCount: 524288,
    hostsPerNetwork: 32,
  });
  // 两个都为空、都无效时报数量缺失
  assert.deepStrictEqual(classful({ ip: '172.16.0.1', netType: 'default', subnets: '', hosts: '' }), {
    ok: false,
    error: 'CLASSFUL_COUNT_MISSING',
  });
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'A', subnets: 'abc', hosts: 'abc' }), {
    ok: false,
    error: 'CLASSFUL_COUNT_MISSING',
  });
  // 主机数过多，网段放不下 C 类的 /24 起点
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'C', subnets: '', hosts: '257' }), {
    ok: false,
    error: 'HOSTS_MISMATCH',
  });
  // 子网数过多，超出 IPv4 的 /32
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'A', subnets: '16777217', hosts: '' }), {
    ok: false,
    error: 'SUBNETS_TOO_LARGE',
  });
});

test('classful：C 类主机数恰好为 256 时仍合法，主机数为 1 时为 /32', () => {
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'C', subnets: '', hosts: '256' }), {
    ok: true,
    netType: 'C',
    mask: '255.255.255.0',
    cidr: 24,
    subnetCount: 1,
    hostsPerNetwork: 256,
  });
  assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType: 'C', subnets: '', hosts: '1' }), {
    ok: true,
    netType: 'C',
    mask: '255.255.255.255',
    cidr: 32,
    subnetCount: 256,
    hostsPerNetwork: 1,
  });
});

test('classful：无法识别的网络类型与 IP 错误', () => {
  assert.deepStrictEqual(classful({ ip: 'bad', netType: 'default', subnets: '4', hosts: '' }), {
    ok: false,
    error: 'CLASSFUL_IP_INVALID',
  });
  for (const ip of ['0.1.2.3', '127.0.0.1', '224.0.0.1']) {
    assert.deepStrictEqual(classful({ ip, netType: 'default', subnets: '4', hosts: '' }), {
      ok: false,
      error: 'NET_TYPE_UNKNOWN',
    }, ip);
  }
  for (const netType of ['X', '', 'a', 'D']) {
    assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType, subnets: '4', hosts: '' }), {
      ok: false,
      error: 'NET_TYPE_UNKNOWN',
    }, netType);
    assert.deepStrictEqual(classful({ ip: '10.0.0.1', netType, subnets: '', hosts: '' }), {
      ok: false,
      error: 'NET_TYPE_UNKNOWN',
    }, netType);
  }
});

test('子网数：2 的幂附近取最小的 2 的幂（2^k-1、2^k、2^k+1），以 A 类为基准', () => {
  // [子网数, CIDR, 子网掩码, 子网总数, 每网地址总数]
  const table: [number, number, string, number, number][] = [
    [1, 8, '255.0.0.0', 1, 16777216],
    [2, 9, '255.128.0.0', 2, 8388608],
    [3, 10, '255.192.0.0', 4, 4194304],
    [4, 10, '255.192.0.0', 4, 4194304],
    [5, 11, '255.224.0.0', 8, 2097152],
    [7, 11, '255.224.0.0', 8, 2097152],
    [8, 11, '255.224.0.0', 8, 2097152],
    [9, 12, '255.240.0.0', 16, 1048576],
    [255, 16, '255.255.0.0', 256, 65536],
    [256, 16, '255.255.0.0', 256, 65536],
    [257, 17, '255.255.128.0', 512, 32768],
    [1023, 18, '255.255.192.0', 1024, 16384],
    [1024, 18, '255.255.192.0', 1024, 16384],
    [1025, 19, '255.255.224.0', 2048, 8192],
  ];
  for (const [subnets, cidr, mask, subnetCount, hostsPerNetwork] of table) {
    assert.deepStrictEqual(
      classful({ ip: '10.0.0.1', netType: 'A', subnets: String(subnets), hosts: '' }),
      { ok: true, netType: 'A', mask, cidr, subnetCount, hostsPerNetwork },
      `subnets=${subnets}`,
    );
  }
});

test('主机数：2 的幂附近取最小的 2 的幂（2^k-1、2^k、2^k+1），以 A 类为基准', () => {
  // [每网主机数, CIDR, 子网掩码, 每网地址总数, 子网总数]
  const table: [number, number, string, number, number][] = [
    [1, 32, '255.255.255.255', 1, 16777216],
    [2, 31, '255.255.255.254', 2, 8388608],
    [3, 30, '255.255.255.252', 4, 4194304],
    [4, 30, '255.255.255.252', 4, 4194304],
    [5, 29, '255.255.255.248', 8, 2097152],
    [255, 24, '255.255.255.0', 256, 65536],
    [256, 24, '255.255.255.0', 256, 65536],
    [257, 23, '255.255.254.0', 512, 32768],
    [65535, 16, '255.255.0.0', 65536, 256],
    [65536, 16, '255.255.0.0', 65536, 256],
    [65537, 15, '255.254.0.0', 131072, 128],
  ];
  for (const [hosts, cidr, mask, hostsPerNetwork, subnetCount] of table) {
    assert.deepStrictEqual(
      classful({ ip: '10.0.0.1', netType: 'A', subnets: '', hosts: String(hosts) }),
      { ok: true, netType: 'A', mask, cidr, subnetCount, hostsPerNetwork },
      `hosts=${hosts}`,
    );
  }
});

test('CALC_ERRORS：错误码集合固定，文案非空，中文与拉丁字母之间只有一个空格', () => {
  assert.deepStrictEqual(Object.keys(CALC_ERRORS).sort(), [
    'CIDR_RANGE',
    'CLASSFUL_COUNT_MISSING',
    'CLASSFUL_IP_INVALID',
    'CONVERT_INPUT_INVALID',
    'HEX32_INVALID',
    'HOSTS_MISMATCH',
    'IPV4_INVALID',
    'MASK_CONVERTER_BITS_INVALID',
    'MASK_CONVERTER_DOTTED_INVALID',
    'MASK_CONVERTER_EMPTY',
    'MASK_CONVERTER_NOT_CONTIGUOUS',
    'MASK_INVALID',
    'MASK_NOT_CONTIGUOUS',
    'NETWORK_RANGE_INVALID',
    'NET_TYPE_UNKNOWN',
    'NODE_INPUT_INVALID',
    'NODE_MASK_NOT_CONTIGUOUS',
    'REQUIRED_INVALID',
    'REQUIRED_TOO_LARGE',
    'SUBNETS_TOO_LARGE',
  ]);
  for (const [code, text] of Object.entries(CALC_ERRORS)) {
    assert.ok(text.zh.length > 0 && text.en.length > 0, code);
    assert.doesNotMatch(text.zh, /[\u3400-\u9fff\uf900-\ufaff][A-Za-z0-9]|[A-Za-z0-9][\u3400-\u9fff\uf900-\ufaff]/, code);
    assert.doesNotMatch(text.zh, /\s{2}/, code);
  }
  assert.strictEqual(CALC_ERRORS.CIDR_RANGE.zh, '输入无效：CIDR 位数范围应为 0-32。');
  assert.strictEqual(CALC_ERRORS.REQUIRED_TOO_LARGE.zh, '地址数量过大，超出 IPv4 范围。');
  assert.strictEqual(CALC_ERRORS.NET_TYPE_UNKNOWN.zh, '无法识别网络类型：请输入 A/B/C 类地址或手动选择网络类型。');
});

test('性质：随机 32 位整数经各种格式往返后保持不变（固定种子）', () => {
  const random = seededRandom(20261107);
  for (let i = 0; i < 300; i++) {
    const value = Math.floor(random() * 4294967296);
    assert.strictEqual(parseIPv4(toIPv4(value)), value);
    assert.strictEqual(parseHex32(toHex32(value)), value);
    assert.strictEqual(parseHex32(toHexOctets(value)), value);
    assert.strictEqual(parseBinary32(toBinOctets(value)), value);
  }
});

test('性质：位数与掩码互转可逆，地址数与可用数的不变式成立（固定种子）', () => {
  for (let bits = 0; bits <= 32; bits++) {
    assert.strictEqual(cidrFromMask(maskFromCidr(bits) ?? -1), bits, `bits=${bits}`);
    const { total, usable } = hostStats(bits);
    assert.strictEqual(total, 2 ** (32 - bits), `total bits=${bits}`);
    assert.strictEqual(total - usable, bits >= 31 ? 0 : 2, `usable bits=${bits}`);
  }
  const random = seededRandom(20261107);
  for (let i = 0; i < 300; i++) {
    const ip = Math.floor(random() * 4294967296);
    const bits = Math.floor(random() * 33);
    const range = networkRange(toIPv4(ip), String(bits));
    assert.ok(range.ok, `bits=${bits}`);
    if (!range.ok) continue;
    const network = ipValue(range.network);
    const broadcast = ipValue(range.broadcast);
    assert.ok(network <= ip && ip <= broadcast, `ip=${toIPv4(ip)} bits=${bits}`);
    assert.strictEqual(ipValue(range.last) - ipValue(range.first) + 1, range.usable, `count bits=${bits}`);
  }
});
