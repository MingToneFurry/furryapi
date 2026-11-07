// /llms.txt：给 AI 助手和编程代理的站点目录，内容见 src/lib/llms.ts
import type { APIRoute } from 'astro';
import { llmsIndex } from '../lib/llms';

export const prerender = true;

export const GET: APIRoute = () => new Response(llmsIndex(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
