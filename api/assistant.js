// Vercel serverless function. The OpenAI key stays on the server.
import { createClient } from "@supabase/supabase-js";
export default async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).json({error:"Método não permitido."});}
 try{
  const auth=req.headers.authorization||"";
  if(!auth.startsWith("Bearer "))return res.status(401).json({error:"Faça login novamente."});
  const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
  const token=auth.slice(7);
  const {data:{user},error}=await supabase.auth.getUser(token);
  if(error||!user)return res.status(401).json({error:"Sessão inválida."});
  const {subject,question,attempt}=req.body||{};
  if(typeof question!=="string"||question.trim().length<3||question.length>12000)return res.status(400).json({error:"Envie uma questão válida (até 12.000 caracteres)."});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:"O administrador ainda não configurou a chave da IA."});
  const prompt=`Você é um tutor escolar paciente. Ajude o estudante a aprender. Explique o conceito e o raciocínio em passos claros, avalie a tentativa se houver, e termine com uma resposta sugerida e uma breve conferência. Não afirme que enviou ou concluiu uma atividade em qualquer plataforma. Se a questão parecer uma avaliação, priorize explicação e apoio ao raciocínio, não alegue acesso ao sistema escolar.\nMatéria: ${String(subject||"Não informada").slice(0,60)}\nEnunciado:\n${question.trim()}\nTentativa do estudante:\n${String(attempt||"Não informada").slice(0,3000)}`;
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-6-astra",input:prompt,max_output_tokens:1200})});
  const data=await response.json();
  if(!response.ok)return res.status(502).json({error:data.error?.message||"A IA não respondeu."});
  const answer=(data.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==="output_text").map(c=>c.text).join("\n");
  return res.status(200).json({answer:answer||"Não foi possível gerar uma explicação. Tente novamente."});
 }catch(e){return res.status(500).json({error:"Erro interno ao consultar a IA."});}
}
