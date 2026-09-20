import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type Key = { id:string; keyString:string; validUntil:string; maxDevices:number; isActive:boolean; devices?: {id:string;deviceName:string;hardwareUuid:string;linkedAt:string}[] };
type Resource = { id:string; name:string; description?:string; bundleId:string; targetFilePath:string; targetFilename:string; status:string; currentVersion?:{id:string;version:string;fileSize:number;createdAt:string} };

async function api(path:string, options:RequestInit={}) {
  const token=localStorage.getItem('adminToken');
  const headers=new Headers(options.headers);
  headers.set('Content-Type','application/json');
  if(token) headers.set('Authorization',`Bearer ${token}`);
  const r=await fetch(API+path,{...options,headers});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.message||'Erro na API');
  return data;
}

function Login({onLogin}:{onLogin:(d:any)=>void}) {
  const [email,setEmail]=useState('admin@system.com'),[password,setPassword]=useState('admin123'),[error,setError]=useState('');
  const submit=async(e:any)=>{e.preventDefault();try{const d=await api('/admin/login',{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem('adminToken',d.token);onLogin(d.admin)}catch(e:any){setError(e.message)}};
  return <main className="center"><form className="card login" onSubmit={submit}><h1>iOS Resource Manager</h1><p>Painel administrativo</p><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha"/><button>Entrar</button>{error&&<div className="error">{error}</div>}</form></main>;
}

export default function App(){
 const [admin,setAdmin]=useState<any>(null),[keys,setKeys]=useState<Key[]>([]),[resources,setResources]=useState<Resource[]>([]),[tab,setTab]=useState<'keys'|'resources'>('keys'),[message,setMessage]=useState('');
 const [newKey,setNewKey]=useState({count:1,validUntil:'',maxDevices:1});
 const [resource,setResource]=useState({name:'',description:'',bundleId:'',targetFilePath:'',targetFilename:'',status:'OFFLINE'});
 useEffect(()=>{if(localStorage.getItem('adminToken'))setAdmin({});},[]);
 const load=async()=>{try{const [k,r]=await Promise.all([api('/admin/keys'),api('/admin/resources')]);setKeys(k);setResources(r)}catch(e:any){if(e.message.includes('Token')){localStorage.removeItem('adminToken');setAdmin(null)}}};
 useEffect(()=>{if(admin)load()},[admin]);
 if(!admin)return <Login onLogin={setAdmin}/>;
 const createKeys=async()=>{try{await api('/admin/keys',{method:'POST',body:JSON.stringify(newKey)});setMessage('Chaves geradas.');load()}catch(e:any){setMessage(e.message)}};
 const createResource=async()=>{try{await api('/admin/resources',{method:'POST',body:JSON.stringify(resource)});setMessage('Recurso criado.');setResource({name:'',description:'',bundleId:'',targetFilePath:'',targetFilename:'',status:'OFFLINE'});load()}catch(e:any){setMessage(e.message)}};
 const toggle=async(k:Key)=>{await api('/admin/keys/'+k.id,{method:'PATCH',body:JSON.stringify({isActive:!k.isActive})});load()};
 const status=async(r:Resource,s:string)=>{await api('/admin/resources/'+r.id+'/status',{method:'PATCH',body:JSON.stringify({status:s})});load()};
 return <div className="app"><aside><h2>iOS RM</h2><button className={tab==='keys'?'active':''} onClick={()=>setTab('keys')}>🔑 Licenças</button><button className={tab==='resources'?'active':''} onClick={()=>setTab('resources')}>📦 Recursos</button><button onClick={()=>{localStorage.removeItem('adminToken');setAdmin(null)}}>Sair</button></aside><section><header><div><h1>{tab==='keys'?'Licenças':'Recursos'}</h1><span>Painel administrativo</span></div>{message&&<span className="msg">{message}</span>}</header>{tab==='keys'?<><div className="card form"><h3>Gerar License Keys</h3><input type="number" min="1" value={newKey.count} onChange={e=>setNewKey({...newKey,count:+e.target.value})} placeholder="Quantidade"/><input type="datetime-local" value={newKey.validUntil} onChange={e=>setNewKey({...newKey,validUntil:e.target.value})}/><input type="number" min="1" value={newKey.maxDevices} onChange={e=>setNewKey({...newKey,maxDevices:+e.target.value})} placeholder="Máx. dispositivos"/><button onClick={createKeys}>Gerar</button></div><div className="card table"><table><thead><tr><th>Key</th><th>Validade</th><th>Dispositivos</th><th>Status</th><th></th></tr></thead><tbody>{keys.map(k=><tr key={k.id}><td><code>{k.keyString}</code></td><td>{new Date(k.validUntil).toLocaleString()}</td><td>{k.devices?.length||0}/{k.maxDevices}</td><td>{k.isActive?'Ativa':'Desativada'}</td><td><button onClick={()=>toggle(k)}>{k.isActive?'Desativar':'Ativar'}</button></td></tr>)}</tbody></table></div></>:<><div className="card form"><h3>Novo recurso</h3><input placeholder="Nome" value={resource.name} onChange={e=>setResource({...resource,name:e.target.value})}/><input placeholder="Bundle ID" value={resource.bundleId} onChange={e=>setResource({...resource,bundleId:e.target.value})}/><input placeholder="Caminho relativo do arquivo" value={resource.targetFilePath} onChange={e=>setResource({...resource,targetFilePath:e.target.value})}/><input placeholder="Nome do arquivo" value={resource.targetFilename} onChange={e=>setResource({...resource,targetFilename:e.target.value})}/><textarea placeholder="Descrição" value={resource.description} onChange={e=>setResource({...resource,description:e.target.value})}/><button onClick={createResource}>Criar recurso</button></div><div className="card table"><table><thead><tr><th>Nome</th><th>Bundle ID</th><th>Arquivo</th><th>Status</th></tr></thead><tbody>{resources.map(r=><tr key={r.id}><td>{r.name}</td><td><code>{r.bundleId}</code></td><td>{r.targetFilename}</td><td><select value={r.status} onChange={e=>status(r,e.target.value)}><option>ONLINE</option><option>MANUTENCAO</option><option>OFFLINE</option></select></td></tr>)}</tbody></table></div></>}</section></div>;
}
