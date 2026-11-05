import { createClient } from "@supabase/supabase-js";
import "./style.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL,SUPABASE_ANON_KEY) : null;
let user = null, profile = null, tasks = [], mode = "login";
const $ = (s)=>document.querySelector(s);
const esc = (s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const platforms = [
 ["Sala do Futuro","Portal escolar oficial","https://saladofuturo.educacao.sp.gov.br/","SP"],
 ["Tarefa SP","Atividades escolares","https://tarefa.sp.gov.br/","T"],
 ["Redação Paulista","Produção textual","https://redacao.sp.gov.br/","R"],
 ["Leia SP","Leitura e literatura","https://leiasp.educacao.sp.gov.br/","L"],
 ["Alura","Tecnologia e programação","https://www.alura.com.br/","A"],
 ["Matific","Aprendizagem de matemática","https://matific.com/","M"]
];
function authScreen(message=""){
 $("#app").innerHTML=`<main class="auth-wrap"><section class="auth-card"><div class="logo"><i>V</i><span>VELLOZES <b>HACK</b></span></div><p class="kicker">PAINEL ESCOLAR · V2.0</p><h1>${mode==="login"?"Bem-vindo de volta.":"Crie sua conta."}</h1><p class="muted">Entre no seu espaço de estudos seguro.</p><form id="authForm"><label>E-mail<input id="email" type="email" autocomplete="email" required placeholder="voce@email.com"></label><label>Senha<input id="password" type="password" minlength="8" autocomplete="${mode==="login"?"current-password":"new-password"}" required placeholder="Mínimo de 8 caracteres"></label><button class="primary wide">${mode==="login"?"Entrar":"Criar conta"}</button></form><p class="msg" id="authMsg">${esc(message)}</p><button class="link" id="switchAuth">${mode==="login"?"Não tem conta? Criar cadastro":"Já tem conta? Entrar"}</button><p class="tiny">Use um e-mail seu. Nunca informe RA ou senha da escola neste painel.</p></section></main>`;
 $("#switchAuth").onclick=()=>{mode=mode==="login"?"signup":"login";authScreen()};
 $("#authForm").onsubmit=async e=>{e.preventDefault();const email=$("#email").value.trim(),password=$("#password").value;$("#authMsg").textContent="Aguarde…";try{if(!supabase)throw Error("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.");const r=mode==="login"?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});if(r.error)throw r.error;if(mode==="signup"&&!r.data.session){$("#authMsg").textContent="Cadastro criado. Confirme seu e-mail e depois entre.";return;}await boot();}catch(err){$("#authMsg").textContent=err.message||"Não foi possível autenticar.";}};
}
function shell(){
 $("#app").innerHTML=`<div class="layout"><aside class="sidebar" id="sidebar"><div class="logo"><i>V</i><span>VELLOZES <b>HACK</b></span></div><p class="nav-label">ESPAÇO DE ESTUDOS</p><nav><button class="nav active" data-tab="overview">▦ Visão geral</button><button class="nav" data-tab="tasks">☷ Minhas tarefas</button><button class="nav" data-tab="assistant">✳ Assistente IA</button><button class="nav" data-tab="platforms">↗ Plataformas</button><button class="nav admin-only hidden" data-tab="admin">⚙ Administração</button></nav><div class="side-bottom"><span class="online"></span> Conta protegida <small id="userEmail"></small><button class="logout" id="logout">Sair da conta</button></div></aside><main class="content"><header><button class="mobile" id="menu">☰</button><div><span class="kicker">VELLOZES HACK / V2.0</span><h1 id="heading">Visão geral</h1></div><span class="user-pill" id="userPill"></span></header><section id="page"></section></main></div>`;
 $("#logout").onclick=async()=>{await supabase.auth.signOut();user=null;authScreen()};
 $("#menu").onclick=()=>$("#sidebar").classList.toggle("show");
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>go(b.dataset.tab));
}
async function boot(){
 const {data:{user:u}}=await supabase.auth.getUser();if(!u){authScreen();return;}user=u;
 const {data:p}=await supabase.from("profiles").select("display_name,role").eq("id",u.id).maybeSingle();profile=p||{display_name:u.email,role:"student"};
 shell();$("#userEmail").textContent=u.email;$("#userPill").textContent=profile.display_name||u.email;
 if(profile.role==="admin")document.querySelector(".admin-only").classList.remove("hidden");
 await loadTasks();go("overview");
}
async function loadTasks(){const {data,error}=await supabase.from("tasks").select("*").order("created_at",{ascending:false});if(error){toast(error.message);return;}tasks=data||[];}
async function go(tab){
 const titles={overview:"Visão geral",tasks:"Minhas tarefas",assistant:"Assistente IA",platforms:"Plataformas",admin:"Administração"};
 $("#heading").textContent=titles[tab];document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));$("#sidebar").classList.remove("show");
 if(tab==="overview")overview();if(tab==="tasks")taskPage();if(tab==="assistant")assistantPage();if(tab==="platforms")platformPage();if(tab==="admin")adminPage();
}
function overview(){
 const done=tasks.filter(t=>t.done).length,pct=tasks.length?Math.round(done/tasks.length*100):0;
 $("#page").innerHTML=`<section class="hero"><div><span class="kicker cyan">SEU CENTRO DE ESTUDOS</span><h2>Seu progresso,<br><em>no seu ritmo.</em></h2><p>Organize tarefas e use a IA para entender conteúdos e exercícios.</p><button class="primary" id="toTasks">Abrir minhas tarefas →</button></div><div class="orb">VH</div></section><div class="stats"><article><small>TAREFAS</small><strong>${tasks.length}</strong></article><article><small>CONCLUÍDAS</small><strong>${done}</strong></article><article><small>EM ABERTO</small><strong>${tasks.length-done}</strong></article><article><small>PROGRESSO</small><strong>${pct}%</strong><div class="bar"><i style="width:${pct}%"></i></div></article></div><h3>Atividades recentes</h3><div class="stack">${tasks.slice(0,5).map(taskRow).join("")||'<p class="muted">Você ainda não cadastrou tarefas.</p>'}</div><p class="footnote">O Vellozes Hack não é afiliado à Secretaria da Educação ou às plataformas listadas.</p>`;
 $("#toTasks").onclick=()=>go("tasks");bindTaskRows();
}
function taskRow(t){return `<article class="task"><input type="checkbox" data-done="${t.id}" ${t.done?"checked":""}><div class="tasktext"><b>${esc(t.title)}</b><small>${esc(t.subject)} · ${t.due?new Date(t.due+"T12:00:00").toLocaleDateString("pt-BR"):"Sem prazo"}</small></div><button class="delete" data-del="${t.id}" aria-label="Excluir">×</button></article>`;}
function taskPage(){
 $("#page").innerHTML=`<div class="rowhead"><div><h2>Minhas tarefas</h2><p class="muted">Suas atividades ficam salvas na sua conta.</p></div></div><form class="addform" id="taskForm"><input id="title" required maxlength="120" placeholder="Nome da atividade"><input id="subject" required maxlength="50" placeholder="Matéria"><input id="due" type="date"><button class="primary">＋ Adicionar</button></form><div class="stack" id="taskStack">${tasks.map(taskRow).join("")||'<p class="muted">Nenhuma tarefa por enquanto.</p>'}</div>`;
 $("#taskForm").onsubmit=async e=>{e.preventDefault();const {error}=await supabase.from("tasks").insert({user_id:user.id,title:$("#title").value.trim(),subject:$("#subject").value.trim(),due:$("#due").value||null});if(error){toast(error.message);return;}await loadTasks();taskPage();};
 bindTaskRows();
}
function bindTaskRows(){
 document.querySelectorAll("[data-done]").forEach(el=>el.onchange=async()=>{const {error}=await supabase.from("tasks").update({done:el.checked}).eq("id",el.dataset.done);if(error)toast(error.message);await loadTasks();const active=document.querySelector(".nav.active")?.dataset.tab;active==="tasks"?taskPage():overview();});
 document.querySelectorAll("[data-del]").forEach(el=>el.onclick=async()=>{if(!confirm("Excluir esta tarefa?"))return;const {error}=await supabase.from("tasks").delete().eq("id",el.dataset.del);if(error)toast(error.message);await loadTasks();taskPage();});
}
function assistantPage(){
 $("#page").innerHTML=`<div class="two"><section class="panel"><h3>Assistente de questões</h3><p class="muted">Cole uma questão. A IA explica o conteúdo, mostra o raciocínio e ajuda você a revisar sua tentativa.</p><label>Matéria<select id="subjectAI"><option>Matemática</option><option>Ciências</option><option>História</option><option>Geografia</option><option>Português</option><option>Inglês</option><option>Arte</option><option>Outra</option></select></label><label>Enunciado<textarea id="questionAI" rows="8" placeholder="Cole a questão aqui…"></textarea></label><label>Sua tentativa (opcional)<textarea id="attemptAI" rows="3" placeholder="O que você já tentou?"></textarea></label><button class="primary" id="askAI">Pedir explicação à IA</button><p class="tiny" id="aiStatus">Não cole dados pessoais ou informações da sua conta escolar.</p></section><section class="panel answer"><h3>Explicação</h3><div id="answer" class="answertext">A resposta explicada aparecerá aqui.</div></section></div>`;
 $("#askAI").onclick=async()=>{const question=$("#questionAI").value.trim();if(!question){toast("Cole o enunciado primeiro.");return;}$("#askAI").disabled=true;$("#aiStatus").textContent="A IA está analisando…";$("#answer").textContent="Preparando explicação…";try{const r=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(await supabase.auth.getSession()).data.session.access_token},body:JSON.stringify({subject:$("#subjectAI").value,question,attempt:$("#attemptAI").value})});const data=await r.json();if(!r.ok)throw Error(data.error||"Falha ao consultar a IA.");$("#answer").textContent=data.answer;$("#aiStatus").textContent="Revise a explicação e confira se ela responde ao enunciado.";}catch(e){$("#answer").textContent=e.message;$("#aiStatus").textContent="Verifique a configuração do servidor e tente novamente.";}finally{$("#askAI").disabled=false;}};
}
function platformPage(){$("#page").innerHTML=`<h2>Plataformas oficiais</h2><p class="muted">Atalhos para abrir cada serviço. O Vellozes não lê nem altera dados dentro deles.</p><div class="platforms">${platforms.map(p=>`<a class="platform" href="${p[2]}" target="_blank" rel="noopener"><i>${p[3]}</i><span><b>${p[0]}</b><small>${p[1]}</small></span><strong>↗</strong></a>`).join("")}</div>`;}
function adminPage(){$("#page").innerHTML=`<section class="panel"><h2>Administração</h2><p>Área reservada a contas cujo perfil tenha <code>role = 'admin'</code> definido manualmente no painel do Supabase por um administrador do projeto.</p><p class="muted">Por segurança, não existe botão público para promover usuários a administrador.</p></section>`;}
function toast(msg){let el=$("#toast");if(!el){el=document.createElement("div");el.id="toast";document.body.append(el);}el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3500);}
if(!supabase){authScreen("Projeto ainda não configurado: siga o README para conectar o Supabase.");}else{boot();supabase.auth.onAuthStateChange((_event,session)=>{if(!session){user=null;authScreen();}});}
