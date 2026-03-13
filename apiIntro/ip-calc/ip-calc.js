function parseIPv4(ipText) {
  const text = String(ipText || '').trim();
  const parts = text.split('.');
  if (parts.length !== 4) return null;

  const nums = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const value = Number(part);
    if (value < 0 || value > 255) return null;
    nums.push(value);
  }

  return (((nums[0] << 24) >>> 0) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0;
}

function toIPv4(value) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ].join('.');
}

function toBinOctets(value) {
  return [
    ((value >>> 24) & 255).toString(2).padStart(8, '0'),
    ((value >>> 16) & 255).toString(2).padStart(8, '0'),
    ((value >>> 8) & 255).toString(2).padStart(8, '0'),
    (value & 255).toString(2).padStart(8, '0')
  ].join('.');
}

function toHexOctets(value) {
  return [
    ((value >>> 24) & 255).toString(16).toUpperCase().padStart(2, '0'),
    ((value >>> 16) & 255).toString(16).toUpperCase().padStart(2, '0'),
    ((value >>> 8) & 255).toString(16).toUpperCase().padStart(2, '0'),
    (value & 255).toString(16).toUpperCase().padStart(2, '0')
  ].join('.');
}

function maskFromCidr(cidr) {
  const bits = Number(cidr);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return null;
  if (bits === 0) return 0;
  return (0xffffffff << (32 - bits)) >>> 0;
}

function cidrFromMask(maskValue) {
  const bits = maskValue.toString(2).padStart(32, '0');
  const firstZero = bits.indexOf('0');
  if (firstZero === -1) return 32;
  if (bits.slice(firstZero).includes('1')) return null;
  return firstZero;
}

function hostStats(cidr) {
  const hostBits = 32 - cidr;
  const total = Math.pow(2, hostBits);
  let usable = 0;

  if (cidr === 32) usable = 1;
  else if (cidr === 31) usable = 2;
  else usable = Math.max(0, total - 2);

  return { total, usable };
}

function parseHex32(text) {
  const cleaned = String(text || '').trim().replace(/^0x/i, '').replace(/[.\s:-]/g, '');
  if (!/^[a-fA-F0-9]{8}$/.test(cleaned)) return null;
  return parseInt(cleaned, 16) >>> 0;
}

function parseBinary32(text) {
  const cleaned = String(text || '').trim().replace(/[.\s]/g, '');
  if (!/^[01]{32}$/.test(cleaned)) return null;
  return parseInt(cleaned, 2) >>> 0;
}

function inferClassFromIp(ipValue) {
  const first = (ipValue >>> 24) & 255;
  if (first >= 1 && first <= 126) return 'A';
  if (first >= 128 && first <= 191) return 'B';
  if (first >= 192 && first <= 223) return 'C';
  return null;
}

function classBaseBits(classType) {
  if (classType === 'A') return 8;
  if (classType === 'B') return 16;
  if (classType === 'C') return 24;
  return null;
}

function output(targetId, lines, isError) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.classList.toggle('error', Boolean(isError));
  el.textContent = Array.isArray(lines) ? lines.join('\n') : String(lines);
}

function calcNetworkRange() {
  const ip = parseIPv4(document.getElementById('net-ip').value);
  const cidr = Number(document.getElementById('net-cidr').value);
  const mask = maskFromCidr(cidr);

  if (ip === null || mask === null) {
    output('net-result', '输入无效：请检查IP与CIDR位数。', true);
    return;
  }

  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const { total, usable } = hostStats(cidr);
  const first = cidr >= 31 ? network : (network + 1) >>> 0;
  const last = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;

  output('net-result', [
    `可用地址: ${usable}`,
    `地址总数: ${total}`,
    `掩码: ${toIPv4(mask)} /${cidr}`,
    `网络: ${toIPv4(network)}`,
    `第一个可用: ${toIPv4(first)}`,
    `最后可用: ${toIPv4(last)}`,
    `广播: ${toIPv4(broadcast)}`
  ]);
}

function calcMaskToCidr() {
  const mask = parseIPv4(document.getElementById('mask-dotted-to-cidr').value);
  if (mask === null) {
    output('mask-to-cidr-result', '输入无效：请填写正确的点分十进制掩码。', true);
    return;
  }
  const cidr = cidrFromMask(mask);
  if (cidr === null) {
    output('mask-to-cidr-result', '输入无效：掩码必须是连续的1后接连续的0。', true);
    return;
  }
  output('mask-to-cidr-result', [`结果: /${cidr}`]);
}

function calcCidrToMask() {
  const cidr = Number(document.getElementById('cidr-to-mask').value);
  const mask = maskFromCidr(cidr);
  if (mask === null) {
    output('cidr-to-mask-result', '输入无效：CIDR位数范围应为 0-32。', true);
    return;
  }

  output('cidr-to-mask-result', [
    `Dec 十进制: ${mask}`,
    `点分十进制: ${toIPv4(mask)}`,
    `Hex 十六进制: 0x${mask.toString(16).toUpperCase().padStart(8, '0')} (${toHexOctets(mask)})`
  ]);
}

function calcRequiredAddresses() {
  const required = Number(document.getElementById('required-addresses').value);
  if (!Number.isInteger(required) || required <= 0) {
    output('required-to-mask-result', '输入无效：地址数量需为正整数。', true);
    return;
  }

  let bestCidr = 32;
  for (let cidr = 32; cidr >= 0; cidr--) {
    const stats = hostStats(cidr);
    if (stats.usable >= required) {
      bestCidr = cidr;
    }
  }

  const mask = maskFromCidr(bestCidr);
  const stats = hostStats(bestCidr);

  output('required-to-mask-result', [
    `掩码: /${bestCidr}`,
    `dotted dec. 掩码: ${toIPv4(mask)}`,
    `可用地址数量: ${stats.usable}`,
    `地址总数: ${stats.total}`
  ]);
}

function calcDottedToBinHex() {
  const ip = parseIPv4(document.getElementById('dotted-to-binhex').value);
  if (ip === null) {
    output('dotted-to-binhex-result', '输入无效：请填写正确的IPv4地址。', true);
    return;
  }

  output('dotted-to-binhex-result', [
    `Bin 二进制: ${toBinOctets(ip)}`,
    `Hex 十六进制: 0x${ip.toString(16).toUpperCase().padStart(8, '0')} (${toHexOctets(ip)})`
  ]);
}

function calcHexToIp() {
  const value = parseHex32(document.getElementById('hex-to-ip').value);
  if (value === null) {
    output('hex-to-ip-result', '输入无效：请填写8位十六进制数（可带0x）。', true);
    return;
  }

  output('hex-to-ip-result', [
    `点分十进制: ${toIPv4(value)}`,
    `Bin 二进制: ${toBinOctets(value)}`
  ]);
}

function calcMaskInvert() {
  const mask = parseIPv4(document.getElementById('mask-invert').value);
  if (mask === null) {
    output('mask-invert-result', '输入无效：请填写正确的点分十进制掩码。', true);
    return;
  }
  output('mask-invert-result', [`结果: ${toIPv4((~mask) >>> 0)}`]);
}

function calcMaskHostCount() {
  const cidr = Number(document.getElementById('mask-host-count').value);
  const mask = maskFromCidr(cidr);
  if (mask === null) {
    output('mask-host-count-result', '输入无效：CIDR位数范围应为 0-32。', true);
    return;
  }

  const stats = hostStats(cidr);
  output('mask-host-count-result', [
    `可用地址数量: ${stats.usable}`,
    `地址总数: ${stats.total}`,
    `点分十进制格式: ${toIPv4(mask)}`
  ]);
}

function calcClassfulSubnet() {
  const ip = parseIPv4(document.getElementById('classful-ip').value);
  if (ip === null) {
    output('classful-result', '输入无效：请填写正确的TCP/IP地址。', true);
    return;
  }

  const selectedType = document.getElementById('classful-net-type').value;
  const autoType = inferClassFromIp(ip);
  const netType = selectedType === 'default' ? autoType : selectedType;

  if (!netType) {
    output('classful-result', '无法识别网络类型：请输入A/B/C类地址或手动选择网络类型。', true);
    return;
  }

  const baseBits = classBaseBits(netType);
  const subnetsInput = Number(document.getElementById('classful-subnets').value);
  const hostsInput = Number(document.getElementById('classful-hosts').value);

  let cidr;
  let subnetCount;

  if (Number.isInteger(subnetsInput) && subnetsInput > 0) {
    const subnetBits = Math.ceil(Math.log2(subnetsInput));
    cidr = baseBits + subnetBits;
    if (cidr > 32) {
      output('classful-result', '子网数量过大，超出IPv4范围。', true);
      return;
    }
    subnetCount = Math.pow(2, subnetBits);
  } else if (Number.isInteger(hostsInput) && hostsInput > 0) {
    const hostBits = Math.ceil(Math.log2(hostsInput));
    cidr = 32 - hostBits;
    if (cidr < baseBits || cidr > 32) {
      output('classful-result', '主机数量与网络类型不匹配，请调整输入。', true);
      return;
    }
    subnetCount = Math.pow(2, cidr - baseBits);
  } else {
    output('classful-result', '请至少填写“子网数量”或“每网主机数”其中一项。', true);
    return;
  }

  const mask = maskFromCidr(cidr);
  const stats = hostStats(cidr);

  output('classful-result', [
    `网络类型: ${netType}类网`,
    `子网掩码: ${toIPv4(mask)} 或 /${cidr}`,
    `子网数: ${subnetCount}`,
    `每个网络节点/主机数(含网络和广播): ${stats.total}`
  ]);
}

function calcNetworkNode() {
  const mask = parseIPv4(document.getElementById('network-node-mask').value);
  const ip = parseIPv4(document.getElementById('network-node-ip').value);

  if (mask === null || ip === null) {
    output('network-node-result', '输入无效：请检查子网掩码和IP地址。', true);
    return;
  }

  const cidr = cidrFromMask(mask);
  if (cidr === null) {
    output('network-node-result', '子网掩码无效：掩码必须连续。', true);
    return;
  }

  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const stats = hostStats(cidr);

  output('network-node-result', [
    `网络: ${toIPv4(network)}`,
    `节点/主机: 可用 ${stats.usable}，总数 ${stats.total}`,
    `广播地址: ${toIPv4(broadcast)}`
  ]);
}

function convertIpFormats() {
  const dotted = document.getElementById('conv-dotted').value.trim();
  const binary = document.getElementById('conv-binary').value.trim();
  const hex = document.getElementById('conv-hex').value.trim();
  const decimal = document.getElementById('conv-decimal').value.trim();

  let value = null;

  if (dotted) value = parseIPv4(dotted);
  else if (binary) value = parseBinary32(binary);
  else if (hex) value = parseHex32(hex);
  else if (decimal) {
    const dec = Number(decimal);
    if (Number.isInteger(dec) && dec >= 0 && dec <= 4294967295) {
      value = dec >>> 0;
    }
  }

  if (value === null) {
    output('convert-ip-result', '输入无效：请填写任意一种格式（点分/二进制/十六进制/十进制）。', true);
    return;
  }

  output('convert-ip-result', [
    `点分十进制: ${toIPv4(value)}`,
    `二进制: ${toBinOctets(value)}`,
    `十六进制: 0x${value.toString(16).toUpperCase().padStart(8, '0')} (${toHexOctets(value)})`,
    `十进制: ${value}`
  ]);
}

function calcMaskConverter() {
  const dottedText = document.getElementById('mask-converter-dotted').value.trim();
  const bitsText = document.getElementById('mask-converter-bits').value.trim();

  let mask = null;
  let cidr = null;

  if (dottedText) {
    mask = parseIPv4(dottedText);
    if (mask === null) {
      output('mask-converter-result', '输入无效：点分十进制掩码格式错误。', true);
      return;
    }
    cidr = cidrFromMask(mask);
    if (cidr === null) {
      output('mask-converter-result', '输入无效：掩码必须是连续位。', true);
      return;
    }
  } else if (bitsText !== '') {
    cidr = Number(bitsText);
    mask = maskFromCidr(cidr);
    if (mask === null) {
      output('mask-converter-result', '输入无效：位元数需在0-32之间。', true);
      return;
    }
  } else {
    output('mask-converter-result', '请填写点分十进制掩码或位元数之一。', true);
    return;
  }

  output('mask-converter-result', [
    `点分十进制: ${toIPv4(mask)}`,
    `位元数: /${cidr}`,
    `十六进制: 0x${mask.toString(16).toUpperCase().padStart(8, '0')}`
  ]);
}

function calcMaskReverse() {
  const mask = parseIPv4(document.getElementById('mask-reverse').value);
  if (mask === null) {
    output('mask-reverse-result', '输入无效：请填写正确的点分十进制子网掩码。', true);
    return;
  }
  output('mask-reverse-result', [`逆算结果: ${toIPv4((~mask) >>> 0)}`]);
}

function bindEvents() {
  document.getElementById('btn-net-calc').addEventListener('click', calcNetworkRange);
  document.getElementById('btn-mask-to-cidr').addEventListener('click', calcMaskToCidr);
  document.getElementById('btn-cidr-to-mask').addEventListener('click', calcCidrToMask);
  document.getElementById('btn-required-to-mask').addEventListener('click', calcRequiredAddresses);
  document.getElementById('btn-dotted-to-binhex').addEventListener('click', calcDottedToBinHex);
  document.getElementById('btn-hex-to-ip').addEventListener('click', calcHexToIp);
  document.getElementById('btn-mask-invert').addEventListener('click', calcMaskInvert);
  document.getElementById('btn-mask-host-count').addEventListener('click', calcMaskHostCount);
  document.getElementById('btn-classful').addEventListener('click', calcClassfulSubnet);
  document.getElementById('btn-network-node').addEventListener('click', calcNetworkNode);
  document.getElementById('btn-convert-ip').addEventListener('click', convertIpFormats);
  document.getElementById('btn-mask-converter').addEventListener('click', calcMaskConverter);
  document.getElementById('btn-mask-reverse').addEventListener('click', calcMaskReverse);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindEvents);
} else {
  bindEvents();
}