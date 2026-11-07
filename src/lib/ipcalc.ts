// IP 计算器核心逻辑：纯函数，不依赖 DOM，也不引入任何模块，可直接打包进浏览器。
// 输入是表单里的原始字符串；位数与数量返回 number，地址与掩码返回点分十进制字符串。

/** 计算器可能返回的错误码，每个码对应 CALC_ERRORS 中的一段文案 */
export type CalcError =
  | 'NETWORK_RANGE_INVALID'
  | 'MASK_INVALID'
  | 'MASK_NOT_CONTIGUOUS'
  | 'CIDR_RANGE'
  | 'REQUIRED_INVALID'
  | 'REQUIRED_TOO_LARGE'
  | 'IPV4_INVALID'
  | 'HEX32_INVALID'
  | 'CLASSFUL_IP_INVALID'
  | 'NET_TYPE_UNKNOWN'
  | 'SUBNETS_TOO_LARGE'
  | 'HOSTS_MISMATCH'
  | 'CLASSFUL_COUNT_MISSING'
  | 'NODE_INPUT_INVALID'
  | 'NODE_MASK_NOT_CONTIGUOUS'
  | 'CONVERT_INPUT_INVALID'
  | 'MASK_CONVERTER_DOTTED_INVALID'
  | 'MASK_CONVERTER_NOT_CONTIGUOUS'
  | 'MASK_CONVERTER_BITS_INVALID'
  | 'MASK_CONVERTER_EMPTY';

/** 计算结果：ok 为 true 时带回各字段，否则带回错误码 */
export type CalcResult<T> = ({ ok: true } & T) | { ok: false; error: CalcError };

/** 错误文案：zh 大体沿用旧站措辞（术语和页面上的标签统一），中文与拉丁字母、数字之间加一个空格；en 为英文译文 */
export const CALC_ERRORS: Record<CalcError, { zh: string; en: string }> = {
  NETWORK_RANGE_INVALID: {
    zh: '输入无效：请检查 IP 与 CIDR 位数。',
    en: 'Invalid input: check the IP address and the CIDR prefix length.',
  },
  MASK_INVALID: {
    zh: '输入无效：请填写正确的点分十进制掩码。',
    en: 'Invalid input: enter a valid dotted-decimal mask.',
  },
  MASK_NOT_CONTIGUOUS: {
    zh: '输入无效：掩码必须是连续的 1 后接连续的 0。',
    en: 'Invalid input: the mask must be contiguous 1 bits followed by contiguous 0 bits.',
  },
  CIDR_RANGE: {
    zh: '输入无效：CIDR 位数范围应为 0-32。',
    en: 'Invalid input: the CIDR prefix length must be between 0 and 32.',
  },
  REQUIRED_INVALID: {
    zh: '输入无效：地址数量需为正整数。',
    en: 'Invalid input: the number of addresses must be a positive integer.',
  },
  REQUIRED_TOO_LARGE: {
    zh: '地址数量过大，超出 IPv4 范围。',
    en: 'The number of addresses is too large for IPv4.',
  },
  IPV4_INVALID: {
    zh: '输入无效：请填写正确的 IPv4 地址。',
    en: 'Invalid input: enter a valid IPv4 address.',
  },
  HEX32_INVALID: {
    zh: '输入无效：请填写 8 位十六进制数（可带 0x）。',
    en: 'Invalid input: enter an 8-digit hexadecimal number (the 0x prefix is optional).',
  },
  CLASSFUL_IP_INVALID: {
    zh: '输入无效：请填写正确的 IPv4 地址。',
    en: 'Invalid input: enter a valid IPv4 address.',
  },
  NET_TYPE_UNKNOWN: {
    zh: '无法识别网络类型：请输入 A/B/C 类地址或手动选择网络类型。',
    en: 'Cannot determine the network type: enter a Class A, B or C address, or choose a network type.',
  },
  SUBNETS_TOO_LARGE: {
    zh: '子网数量过大，超出 IPv4 范围。',
    en: 'Too many subnets: the result exceeds the IPv4 range.',
  },
  HOSTS_MISMATCH: {
    zh: '主机数量与网络类型不匹配，请调整输入。',
    en: 'The number of hosts does not fit the network type. Adjust the input.',
  },
  CLASSFUL_COUNT_MISSING: {
    zh: '请至少填写“子网数量”或“每网主机数”其中一项。',
    en: 'Enter at least one of "Subnets" or "Hosts per network".',
  },
  NODE_INPUT_INVALID: {
    zh: '输入无效：请检查子网掩码和 IP 地址。',
    en: 'Invalid input: check the subnet mask and the IP address.',
  },
  NODE_MASK_NOT_CONTIGUOUS: {
    zh: '子网掩码无效：掩码必须连续。',
    en: 'Invalid subnet mask: the mask must be contiguous.',
  },
  CONVERT_INPUT_INVALID: {
    zh: '输入无效：请填写任意一种格式（点分/二进制/十六进制/十进制）。',
    en: 'Invalid input: enter a value in any one format (dotted, binary, hexadecimal or decimal).',
  },
  MASK_CONVERTER_DOTTED_INVALID: {
    zh: '输入无效：点分十进制掩码格式错误。',
    en: 'Invalid input: the dotted-decimal mask is malformed.',
  },
  MASK_CONVERTER_NOT_CONTIGUOUS: {
    zh: '输入无效：掩码必须是连续位。',
    en: 'Invalid input: the mask must be contiguous bits.',
  },
  MASK_CONVERTER_BITS_INVALID: {
    zh: '输入无效：位数需在 0-32 之间。',
    en: 'Invalid input: the prefix length must be between 0 and 32.',
  },
  MASK_CONVERTER_EMPTY: {
    zh: '请填写点分十进制掩码或位数之一。',
    en: 'Enter a dotted-decimal mask or a prefix length.',
  },
};

/** 地址总数与可用数 */
export type HostStats = { total: number; usable: number };

/** 解析点分十进制 IPv4，允许前导零（如 010.001.000.001）；格式不对返回 null */
export function parseIPv4(text: string): number | null {
  const parts = text.trim().split('.');
  if (parts.length !== 4) return null;

  const nums: number[] = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const value = Number(part);
    if (value < 0 || value > 255) return null;
    nums.push(value);
  }

  return (((nums[0] << 24) >>> 0) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0;
}

/** 32 位整数转点分十进制 */
export function toIPv4(value: number): string {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
}

/** 32 位整数转点分二进制，每段 8 位 */
export function toBinOctets(value: number): string {
  return [
    ((value >>> 24) & 255).toString(2).padStart(8, '0'),
    ((value >>> 16) & 255).toString(2).padStart(8, '0'),
    ((value >>> 8) & 255).toString(2).padStart(8, '0'),
    (value & 255).toString(2).padStart(8, '0'),
  ].join('.');
}

/** 32 位整数转点分十六进制，每段 2 位大写 */
export function toHexOctets(value: number): string {
  return [
    ((value >>> 24) & 255).toString(16).toUpperCase().padStart(2, '0'),
    ((value >>> 16) & 255).toString(16).toUpperCase().padStart(2, '0'),
    ((value >>> 8) & 255).toString(16).toUpperCase().padStart(2, '0'),
    (value & 255).toString(16).toUpperCase().padStart(2, '0'),
  ].join('.');
}

/** 32 位整数转 0x 开头的 8 位大写十六进制，如 0x0A000001 */
export function toHex32(value: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(8, '0')}`;
}

/** 0-32 位掩码整数，调用方需保证位数合法；位数为 0 时直接返回 0，避免 << 32 回绕 */
function prefixMask(bits: number): number {
  if (bits === 0) return 0;
  return (0xffffffff << (32 - bits)) >>> 0;
}

/** CIDR 位数转掩码整数；不是 0-32 的整数时返回 null */
export function maskFromCidr(bits: number): number | null {
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return null;
  return prefixMask(bits);
}

/** 掩码整数转 CIDR 位数；不是连续的 1 后接连续的 0 时返回 null */
export function cidrFromMask(mask: number): number | null {
  const bits = mask.toString(2).padStart(32, '0');
  const firstZero = bits.indexOf('0');
  if (firstZero === -1) return 32;
  if (bits.slice(firstZero).includes('1')) return null;
  return firstZero;
}

/** 位数对应的地址总数与可用数；/31、/32 按常规约定处理 */
export function hostStats(cidr: number): HostStats {
  const total = Math.pow(2, 32 - cidr);
  let usable = Math.max(0, total - 2);
  if (cidr === 32) usable = 1;
  else if (cidr === 31) usable = 2;
  return { total, usable };
}

/** 解析 8 位十六进制，可带 0x，分隔符可为 . 空白 : -；失败返回 null */
export function parseHex32(text: string): number | null {
  const cleaned = text.trim().replace(/^0x/i, '').replace(/[.\s:-]/g, '');
  if (!/^[a-fA-F0-9]{8}$/.test(cleaned)) return null;
  return parseInt(cleaned, 16) >>> 0;
}

/** 解析 32 位二进制，只去掉 . 与空白；冒号等其他字符视为非法 */
export function parseBinary32(text: string): number | null {
  const cleaned = text.trim().replace(/[.\s]/g, '');
  if (!/^[01]{32}$/.test(cleaned)) return null;
  return parseInt(cleaned, 2) >>> 0;
}

/** 按首字节推断 A/B/C 类，超出范围返回 null */
export function inferClassFromIp(ipValue: number): 'A' | 'B' | 'C' | null {
  const first = (ipValue >>> 24) & 255;
  if (first >= 1 && first <= 126) return 'A';
  if (first >= 128 && first <= 191) return 'B';
  if (first >= 192 && first <= 223) return 'C';
  return null;
}

/** A/B/C 类的基础网络位数；其他类型返回 null */
export function classBaseBits(classType: string): number | null {
  if (classType === 'A') return 8;
  if (classType === 'B') return 16;
  if (classType === 'C') return 24;
  return null;
}

/** 去掉首尾空白后为空，包括全是空白的输入 */
function isBlank(text: string): boolean {
  return text.trim() === '';
}

/** 构造失败结果 */
function fail(error: CalcError): { ok: false; error: CalcError } {
  return { ok: false, error };
}

/** 网络范围的各字段，地址为点分十进制 */
export type NetworkRangeValues = {
  usable: number;
  total: number;
  mask: string;
  cidr: number;
  network: string;
  first: string;
  last: string;
  broadcast: string;
};

/** 按 IP 与 CIDR 位数算网络范围；CIDR 为空或只有空白时报错 */
export function networkRange(ip: string, cidr: string): CalcResult<NetworkRangeValues> {
  const ipValue = parseIPv4(ip);
  // 加 0 把 -0 变成 0，避免结果里出现 -0
  const bits = Number(cidr) + 0;
  const mask = isBlank(cidr) ? null : maskFromCidr(bits);
  if (ipValue === null || mask === null) return fail('NETWORK_RANGE_INVALID');

  const network = (ipValue & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const { total, usable } = hostStats(bits);
  const first = bits >= 31 ? network : (network + 1) >>> 0;
  const last = bits >= 31 ? broadcast : (broadcast - 1) >>> 0;

  return {
    ok: true,
    usable,
    total,
    mask: toIPv4(mask),
    cidr: bits,
    network: toIPv4(network),
    first: toIPv4(first),
    last: toIPv4(last),
    broadcast: toIPv4(broadcast),
  };
}

/** 网络节点的各字段 */
export type NetworkNodeValues = {
  network: string;
  usable: number;
  total: number;
  broadcast: string;
};

/** 按子网掩码与 IP 算网络节点；掩码必须连续 */
export function networkNode(mask: string, ip: string): CalcResult<NetworkNodeValues> {
  const maskValue = parseIPv4(mask);
  const ipValue = parseIPv4(ip);
  if (maskValue === null || ipValue === null) return fail('NODE_INPUT_INVALID');
  const cidr = cidrFromMask(maskValue);
  if (cidr === null) return fail('NODE_MASK_NOT_CONTIGUOUS');

  const network = (ipValue & maskValue) >>> 0;
  const broadcast = (network | (~maskValue >>> 0)) >>> 0;
  const { total, usable } = hostStats(cidr);
  return { ok: true, network: toIPv4(network), usable, total, broadcast: toIPv4(broadcast) };
}

/** 四种格式的原始输入，空字符串表示未填写 */
export type ConvertInput = { dotted: string; binary: string; hex: string; decimal: string };

/** IP 格式互转的各字段 */
export type ConvertIpValues = {
  dotted: string;
  binary: string;
  hex: string;
  hexOctets: string;
  decimal: number;
};

/** 在四种格式之间互转；按点分、二进制、十六进制、十进制的顺序取第一个非空输入，即使它无效也不回落 */
export function convertIp(input: ConvertInput): CalcResult<ConvertIpValues> {
  const dotted = input.dotted.trim();
  const binary = input.binary.trim();
  const hex = input.hex.trim();
  const decimal = input.decimal.trim();

  let value: number | null = null;
  if (dotted) value = parseIPv4(dotted);
  else if (binary) value = parseBinary32(binary);
  else if (hex) value = parseHex32(hex);
  else if (decimal) {
    const dec = Number(decimal);
    if (Number.isInteger(dec) && dec >= 0 && dec <= 4294967295) value = dec >>> 0;
  }

  if (value === null) return fail('CONVERT_INPUT_INVALID');
  return {
    ok: true,
    dotted: toIPv4(value),
    binary: toBinOctets(value),
    hex: toHex32(value),
    hexOctets: toHexOctets(value),
    decimal: value,
  };
}

/** 点分掩码转 CIDR 位数；掩码必须连续 */
export function maskToCidr(mask: string): CalcResult<{ cidr: number }> {
  const value = parseIPv4(mask);
  if (value === null) return fail('MASK_INVALID');
  const cidr = cidrFromMask(value);
  if (cidr === null) return fail('MASK_NOT_CONTIGUOUS');
  return { ok: true, cidr };
}

/** CIDR 位数转掩码的各字段 */
export type CidrToMaskValues = {
  decimal: number;
  dotted: string;
  hex: string;
  hexOctets: string;
};

/** CIDR 位数转掩码；空输入或超出 0-32 报错 */
export function cidrToMask(cidr: string): CalcResult<CidrToMaskValues> {
  const bits = Number(cidr);
  const mask = isBlank(cidr) ? null : maskFromCidr(bits);
  if (mask === null) return fail('CIDR_RANGE');
  return {
    ok: true,
    decimal: mask,
    dotted: toIPv4(mask),
    hex: toHex32(mask),
    hexOctets: toHexOctets(mask),
  };
}

/** 地址数量转最小网段的各字段 */
export type RequiredToMaskValues = {
  cidr: number;
  dotted: string;
  usable: number;
  total: number;
};

/** 能放下 count 个可用地址的最小网段：从 /32 往 /0 扫描，第一个够用的位数；放不下时返回 null */
function fitBits(count: number): number | null {
  for (let bits = 32; bits >= 0; bits--) {
    if (hostStats(bits).usable >= count) return bits;
  }
  return null;
}

/** 按需要的可用地址数选出最小的网段 */
export function requiredToMask(required: string): CalcResult<RequiredToMaskValues> {
  const count = isBlank(required) ? 0 : Number(required);
  if (!Number.isInteger(count) || count <= 0) return fail('REQUIRED_INVALID');

  const bits = fitBits(count);
  if (bits === null) return fail('REQUIRED_TOO_LARGE');
  const { total, usable } = hostStats(bits);
  return { ok: true, cidr: bits, dotted: toIPv4(prefixMask(bits)), usable, total };
}

/** 掩码取反得到通配符掩码 */
export function invertMask(mask: string): CalcResult<{ wildcard: string }> {
  const value = parseIPv4(mask);
  if (value === null) return fail('MASK_INVALID');
  return { ok: true, wildcard: toIPv4((~value) >>> 0) };
}

/** 点分 IPv4 转二进制与十六进制 */
export function dottedToBinHex(ip: string): CalcResult<{ binary: string; hex: string; hexOctets: string }> {
  const value = parseIPv4(ip);
  if (value === null) return fail('IPV4_INVALID');
  return { ok: true, binary: toBinOctets(value), hex: toHex32(value), hexOctets: toHexOctets(value) };
}

/** 8 位十六进制转点分 IPv4 与二进制 */
export function hexToIp(hex: string): CalcResult<{ dotted: string; binary: string }> {
  const value = parseHex32(hex);
  if (value === null) return fail('HEX32_INVALID');
  return { ok: true, dotted: toIPv4(value), binary: toBinOctets(value) };
}

/** CIDR 位数的可用地址数、总数与点分掩码；空输入或超出 0-32 报错 */
export function maskHostCount(cidr: string): CalcResult<{ usable: number; total: number; dotted: string }> {
  const bits = Number(cidr);
  const mask = isBlank(cidr) ? null : maskFromCidr(bits);
  if (mask === null) return fail('CIDR_RANGE');
  const { total, usable } = hostStats(bits);
  return { ok: true, usable, total, dotted: toIPv4(mask) };
}

/** 掩码的两种输入：点分或位数，空字符串表示未填写 */
export type MaskConverterInput = { dotted: string; bits: string };

/** 掩码互转的各字段 */
export type MaskConverterValues = { dotted: string; cidr: number; hex: string };

/** 掩码与位数互转；点分非空时只看点分，否则看位数 */
export function maskConverter(input: MaskConverterInput): CalcResult<MaskConverterValues> {
  const dottedText = input.dotted.trim();
  const bitsText = input.bits.trim();

  if (dottedText) {
    const value = parseIPv4(dottedText);
    if (value === null) return fail('MASK_CONVERTER_DOTTED_INVALID');
    const cidr = cidrFromMask(value);
    if (cidr === null) return fail('MASK_CONVERTER_NOT_CONTIGUOUS');
    return { ok: true, dotted: toIPv4(value), cidr, hex: toHex32(value) };
  }

  if (bitsText) {
    // 加 0 把 -0 变成 0，避免结果里出现 -0
    const bits = Number(bitsText) + 0;
    const mask = maskFromCidr(bits);
    if (mask === null) return fail('MASK_CONVERTER_BITS_INVALID');
    return { ok: true, dotted: toIPv4(mask), cidr: bits, hex: toHex32(mask) };
  }

  return fail('MASK_CONVERTER_EMPTY');
}

/** 分类子网的原始输入：IP、网络类型（default 表示按首字节推断）、子网数与每网主机数 */
export type ClassfulInput = { ip: string; netType: string; subnets: string; hosts: string };

/** 分类子网的各字段；usable 和 total 是每个子网的可用地址数和地址总数（含网络地址和广播地址） */
export type ClassfulValues = {
  netType: string;
  mask: string;
  cidr: number;
  subnetCount: number;
  usable: number;
  total: number;
};

/** 按 A/B/C 类划分子网：子网数量为正整数时优先，否则按每网主机数推算。主机数按可用地址算，和 requiredToMask 一致 */
export function classful(input: ClassfulInput): CalcResult<ClassfulValues> {
  const ipValue = parseIPv4(input.ip);
  if (ipValue === null) return fail('CLASSFUL_IP_INVALID');

  const netType = input.netType === 'default' ? inferClassFromIp(ipValue) : input.netType;
  const baseBits = netType === null ? null : classBaseBits(netType);
  if (netType === null || baseBits === null) return fail('NET_TYPE_UNKNOWN');

  // 子网数量不是正整数（空、0、小数等）时回落到每网主机数
  const subnetsValue = Number(input.subnets);
  const hostsValue = Number(input.hosts);
  let cidr: number;
  let subnetCount: number;

  if (Number.isInteger(subnetsValue) && subnetsValue > 0) {
    const subnetBits = Math.ceil(Math.log2(subnetsValue));
    cidr = baseBits + subnetBits;
    if (cidr > 32) return fail('SUBNETS_TOO_LARGE');
    subnetCount = Math.pow(2, subnetBits);
  } else if (Number.isInteger(hostsValue) && hostsValue > 0) {
    // 放下这么多主机的最小网段比这一类的网络还大时，说明主机数和网络类型不匹配
    const bits = fitBits(hostsValue);
    if (bits === null || bits < baseBits) return fail('HOSTS_MISMATCH');
    cidr = bits;
    subnetCount = Math.pow(2, cidr - baseBits);
  } else {
    return fail('CLASSFUL_COUNT_MISSING');
  }

  const { total, usable } = hostStats(cidr);
  return {
    ok: true,
    netType,
    mask: toIPv4(prefixMask(cidr)),
    cidr,
    subnetCount,
    usable,
    total,
  };
}
