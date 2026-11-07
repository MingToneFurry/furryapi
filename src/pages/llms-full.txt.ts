// /llms-full.txt：中文的完整接口文档（Markdown），内容见 src/lib/llms.ts
import type { APIRoute } from 'astro';
import { llmsFull } from '../lib/llms';

export const prerender = true;

export const GET: APIRoute = () => new Response(llmsFull('zh'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
