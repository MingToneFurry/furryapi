import { test } from 'node:test';
import assert from 'node:assert';
import { extractDouyinUrl } from './douyin-url.ts';

test('从分享口令里取出短链', () => {
  const text = '3.89 复制打开抖音，看看【某某的作品】今天也很可爱 https://v.douyin.com/DQyLiuMdIlk/ abc:/ 07/12 dNn:/';
  assert.strictEqual(extractDouyinUrl(text), 'https://v.douyin.com/DQyLiuMdIlk/');
});

test('普通链接原样返回', () => {
  assert.strictEqual(extractDouyinUrl('https://v.douyin.com/DQyLiuMdIlk/'), 'https://v.douyin.com/DQyLiuMdIlk/');
  assert.strictEqual(extractDouyinUrl('http://v.douyin.com/abc/'), 'http://v.douyin.com/abc/');
});

test('链接末尾的句号不属于链接', () => {
  assert.strictEqual(extractDouyinUrl('https://v.douyin.com/DQyLiuMdIlk/。'), 'https://v.douyin.com/DQyLiuMdIlk/');
  assert.strictEqual(extractDouyinUrl('https://v.douyin.com/DQyLiuMdIlk/.'), 'https://v.douyin.com/DQyLiuMdIlk/');
});

test('紧贴中文的链接只取到中文之前', () => {
  assert.strictEqual(extractDouyinUrl('https://v.douyin.com/abc/复制此链接'), 'https://v.douyin.com/abc/');
  assert.strictEqual(extractDouyinUrl('打开https://v.douyin.com/abc/'), 'https://v.douyin.com/abc/');
});

test('中文后面紧跟的 ASCII 冒号或分隔符不影响取链', () => {
  assert.strictEqual(extractDouyinUrl('链接:https://v.douyin.com/abc'), 'https://v.douyin.com/abc');
  assert.strictEqual(extractDouyinUrl('口令;v.douyin.com/abc,'), 'https://v.douyin.com/abc');
});

test('没有协议的抖音链接补上 https://', () => {
  assert.strictEqual(extractDouyinUrl('看看 www.douyin.com/video/123 分享'), 'https://www.douyin.com/video/123');
});

test('同时有 iesdouyin 和 v.douyin.com 链接时优先返回短链', () => {
  const text = 'https://www.iesdouyin.com/share/video/7586536606472277274/ 复制 https://v.douyin.com/DQyLiuMdIlk/';
  assert.strictEqual(extractDouyinUrl(text), 'https://v.douyin.com/DQyLiuMdIlk/');
});

test('只有 iesdouyin 链接时返回它', () => {
  const link = 'https://www.iesdouyin.com/share/video/7586536606472277274/';
  assert.strictEqual(extractDouyinUrl(link), link);
});

test('假冒的域名不是抖音链接', () => {
  const text = '复制 https://douyin.com.evil.example/video/1 打开';
  assert.strictEqual(extractDouyinUrl(text), text);

  const substring = 'https://evil.example/?x=v.douyin.com/abc';
  assert.strictEqual(extractDouyinUrl(substring), substring);

  const suffix = 'https://xdouyin.com/video/1';
  assert.strictEqual(extractDouyinUrl(suffix), suffix);
});

test('假冒域名和真链接同时出现时返回真链接', () => {
  assert.strictEqual(
    extractDouyinUrl('https://douyin.com.evil.example/ 复制 https://v.douyin.com/abc/'),
    'https://v.douyin.com/abc/',
  );
});

test('全角空格也能分开链接', () => {
  assert.strictEqual(
    extractDouyinUrl('　https://douyin.com/video/1　https://v.douyin.com/abc/　'),
    'https://v.douyin.com/abc/',
  );
  assert.strictEqual(extractDouyinUrl('　https://douyin.com/video/1　'), 'https://douyin.com/video/1');
});

test('被括号或引号包住的链接', () => {
  assert.strictEqual(extractDouyinUrl('（链接：(https://v.douyin.com/abc)）'), 'https://v.douyin.com/abc');
  assert.strictEqual(extractDouyinUrl('"https://v.douyin.com/abc"'), 'https://v.douyin.com/abc');
  assert.strictEqual(extractDouyinUrl('“https://v.douyin.com/abc”'), 'https://v.douyin.com/abc');
  assert.strictEqual(extractDouyinUrl('<https://v.douyin.com/abc>'), 'https://v.douyin.com/abc');
});

test('没有链接时返回去掉首尾空白后的原文', () => {
  assert.strictEqual(extractDouyinUrl('  没有链接的文字  '), '没有链接的文字');
});

test('非抖音的链接原样返回，交给接口处理', () => {
  assert.strictEqual(extractDouyinUrl('  https://example.com/  '), 'https://example.com/');
});

test('空输入返回空字符串', () => {
  assert.strictEqual(extractDouyinUrl(''), '');
  assert.strictEqual(extractDouyinUrl('   '), '');
});

test('同一个词里有两个链接时分开判断', () => {
  assert.strictEqual(extractDouyinUrl('https://v.douyin.com/abc/,https://v.douyin.com/def/'), 'https://v.douyin.com/abc/');
  assert.strictEqual(extractDouyinUrl('https://www.douyin.com/video/1,https://v.douyin.com/def/'), 'https://v.douyin.com/def/');
});

test('协议或端口不完整时不报错', () => {
  assert.strictEqual(extractDouyinUrl('看看 https:// 复制'), '看看 https:// 复制');
  assert.strictEqual(extractDouyinUrl('看看 https://v.douyin.com:abc/x'), '看看 https://v.douyin.com:abc/x');
});
