'use strict';
const C=PontualCore,$=s=>document.querySelector(s), KEY='pontual-estoque-avaliacao-v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brl=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
const date=d=>d.split('-').reverse().join('/');
let state=C.empty(),storageError=false;
try{const saved=localStorage.getItem(KEY);if(saved){state=JSON.parse(saved);if(state.version!==1||!Array.isArray(state.products))throw Error('Dados incompatíveis.');}}catch(e){storageError=true;alert('Não foi possível carregar os dados. Nenhuma alteração será salva. Preserve os dados e procure suporte.');}
let formAction=null,toastTimer,editingOrder=false;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function commit(next){
  if(storageError)throw Error('O armazenamento está indisponível.');
  const actual=JSON.parse(localStorage.getItem(KEY)||'null');
  if(actual&&actual.revision!==state.revision){state=actual;render();throw Error('Os dados mudaram em outra aba. Feche este formulário e confira os dados atualizados.');}
  next.revision=state.revision+1;localStorage.setItem(KEY,JSON.stringify(next));state=next;render();
}
function badge(g){return `<span class="badge ${g==='PD'?'pd':g==='LD'?'ld':''}">${esc(g)}</span>`;}
function render(){
  $('#stats').innerHTML=[['Chapas disponíveis',state.products.reduce((a,p)=>a+p.stock,0),'Unidades conferidas'],['Primeira',state.products.filter(p=>p.grade==='Primeira').reduce((a,p)=>a+p.stock,0),'Sem defeitos'],['PD',state.products.filter(p=>p.grade==='PD').reduce((a,p)=>a+p.stock,0),'Pequenos detalhes'],['LD',state.products.filter(p=>p.grade==='LD').reduce((a,p)=>a+p.stock,0),'Leves defeitos']].map(([t,n,s])=>`<div class="stat"><span>${t}</span><strong>${n}</strong><small>${s}</small></div>`).join('');
  const q=$('#search').value.toLowerCase(),grade=$('#grade-filter').value;
  const products=state.products.filter(p=>(p.color+' '+p.brand).toLowerCase().includes(q)&&(!grade||p.grade===grade));
  $('#products').innerHTML=products.map(p=>`<tr><td>${esc(p.color)}</td><td>${p.thickness} mm</td><td>${esc(p.brand)}</td><td>${badge(p.grade)}</td><td>${brl(p.price)}</td><td><strong class="quantity">${p.stock}</strong> <span class="muted">chapas</span></td></tr>`).join('')|| (state.products.length?'<tr><td colspan="6" class="muted">Nenhuma chapa encontrada para esses filtros.</td></tr>':'');
  $('#stock-empty').hidden=state.products.length>0;$('#product-count').textContent=products.length+' tipos';
  $('#clients').innerHTML=state.clients.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.document)||'—'}</td><td>${esc(c.cellphone||c.phone)||'—'}</td><td>${esc(c.city)||'—'}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">Nenhum cliente cadastrado. Use “Cadastrar cliente” para começar.</td></tr>';
  $('#orders').innerHTML=state.orders.map(o=>`<tr><td>#${String(o.number).padStart(4,'0')}</td><td>${esc(o.client.name)}</td><td>${esc(date(o.date))}</td><td>${badge(o.status)}</td><td>${brl(o.total-o.discount)}</td><td><div class="order-controls">${o.status==='Orçamento'?`<button class="small" data-confirm="${esc(o.id)}">Confirmar pedido</button>`:''}<button class="small secondary" data-print="${esc(o.id)}">Imprimir</button></div></td></tr>`).join('')||'<tr><td colspan="6" class="muted">Nenhum pedido. Cadastre as chapas e um cliente para começar.</td></tr>';
  $('#movements').innerHTML=state.movements.map(m=>`<tr><td>${esc(new Date(m.date).toLocaleString('pt-BR'))}</td><td>${esc(m.description)}</td><td>${badge(m.kind)}</td><td>${m.qty>0?'+':''}${m.qty}</td><td>${esc(m.reason)}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">As entradas e confirmações de pedidos aparecerão aqui.</td></tr>';
}
function field(name,label,type='text',value='',extra=''){return `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;}
function select(name,label,options){return `<label class="field">${label}<select name="${name}" required>${options}</select></label>`;}
function options(list,label,key='id'){return list.map(x=>`<option value="${esc(x[key])}">${esc(label(x))}</option>`).join('');}
function modal(title,content,action,button='Salvar'){
  $('#modal-title').textContent=title;$('#form-content').innerHTML=content;$('#form-error').textContent='';$('#save').textContent=button;$('#save').disabled=false;formAction=action;$('#modal').showModal();
}
function closeModal(){$('#modal').close();editingOrder=false;}
$('#close-modal').onclick=$('#cancel-modal').onclick=closeModal;
$('#modal').addEventListener('close',()=>editingOrder=false);
$('#form').onsubmit=e=>{e.preventDefault();$('#save').disabled=true;try{formAction(Object.fromEntries(new FormData(e.target)));closeModal();}catch(error){$('#form-error').textContent=error.message;}finally{$('#save').disabled=false;}};
const views={estoque:['Estoque de chapas','Cada cor, espessura, marca e classificação tem seu próprio saldo.'],pedidos:['Pedidos e orçamentos','Da venda à impressão, com o estoque atualizado.'],clientes:['Clientes','Informações organizadas para agilizar o atendimento.'],historico:['Movimentações','Acompanhe a origem de cada entrada e saída de chapas.']};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==b.dataset.view);document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));$('#page-title').textContent=views[b.dataset.view][0];$('#page-description').textContent=views[b.dataset.view][1];});
$('#search').oninput=$('#grade-filter').onchange=render;
$('#new-product').onclick=()=>modal('Cadastrar tipo de chapa',`<div class="grid">${field('color','Cor / padrão *','text','','required maxlength="120"')}${field('thickness','Espessura em mm *','number','15','required min="0.1" max="100" step="0.1"')}${field('brand','Marca *','text','','required maxlength="100"')}${select('grade','Classificação *',C.classes.map(g=>`<option>${g}</option>`).join(''))}${field('price','Preço de referência (R$) *','number','0','required min="0" max="100000000" step="0.01"')}<p class="full">A quantidade começa em zero. Registre a contagem conferida em “Registrar entrada”.</p></div>`,d=>{commit(C.product(state,d));toast('Tipo de chapa cadastrado.');});
$('#new-entry').onclick=()=>{
  if(!state.products.length)return toast('Cadastre primeiro um tipo de chapa.');
  modal('Registrar entrada conferida',`<div class="grid"><div class="full">${select('productId','Chapa *',options(state.products,C.label))}</div>${field('qty','Quantidade de chapas *','number','1','required min="1" step="1"')}${field('reason','Origem / observação *','text','','required maxlength="300" placeholder="Ex.: contagem inicial, fornecedor ou recebimento"')}<p class="full">Separe Primeira, PD e LD antes de registrar. Cada classificação deve ter sua própria entrada.</p></div>`,d=>{commit(C.entry(state,d));toast('Entrada registrada no estoque.');},'Registrar entrada');
};
$('#new-client').onclick=()=>modal('Cadastrar cliente',`<div class="grid">${field('name','Nome / razão social *','text','','required maxlength="160"')}${field('document','CPF / CNPJ')}${field('rg','RG / inscrição estadual')}${field('birthdate','Data de nascimento','date')}${field('responsible','Responsável')}${field('address','Endereço')}${field('number','Número')}${field('complement','Complemento')}${field('neighborhood','Bairro')}${field('condominium','Condomínio')}${field('city','Cidade')}${field('state','Estado','text','','maxlength="2"')}${field('zip','CEP')}${field('phone','Telefone')}${field('businessPhone','Telefone comercial')}${field('cellphone','Celular')}${field('email','E-mail','email')}</div>`,d=>{commit(C.client(state,d));toast('Cliente cadastrado.');});
let rowCounter=0;
function addItem(){
  const row=document.createElement('div');row.className='item-row';row.dataset.row=++rowCounter;
  row.innerHTML=`${select('product_'+rowCounter,'Chapa',options(state.products,p=>C.label(p)+' · '+p.stock+' disponíveis'))}${field('qty_'+rowCounter,'Quantidade','number','1','required min="1" step="1"')}${field('price_'+rowCounter,'Preço (R$)','number',(state.products[0].price/100).toFixed(2),'required min="0" step="0.01" max="100000000"')}<button type="button" class="secondary icon" aria-label="Remover item">×</button>`;
  row.querySelector('select').onchange=e=>{row.querySelectorAll('input')[1].value=(state.products.find(p=>p.id===e.target.value).price/100).toFixed(2);updateTotal();};
  row.querySelector('button').onclick=()=>{row.remove();updateTotal();};row.oninput=updateTotal;$('#order-items').append(row);updateTotal();
}
function collectItems(){return [...document.querySelectorAll('.item-row')].map(row=>({productId:row.querySelector('select').value,qty:Number(row.querySelectorAll('input')[0].value),price:C.money(row.querySelectorAll('input')[1].value)}));}
function updateTotal(){try{const sum=collectItems().reduce((a,i)=>a+i.qty*i.price,0),discount=C.money($('#form [name=discount]').value||0);$('#order-total').textContent='Total a pagar: '+brl(sum-discount);}catch{$('#order-total').textContent='Confira os valores';}}
$('#new-order').onclick=()=>{
  if(!state.products.length||!state.clients.length)return toast('Cadastre ao menos uma chapa e um cliente antes de criar pedidos.');
  modal('Novo pedido / orçamento',`<div class="grid">${select('clientId','Cliente *',options(state.clients,c=>c.name))}${field('seller','Vendedor *','text','Letícia','required maxlength="120"')}${field('date','Data da venda *','date',today(),'required')}${field('delivery','Prazo de entrega','date')}</div><h3 class="section-title">Chapas do pedido</h3><div id="order-items"></div><button type="button" id="add-item" class="small secondary">+ Adicionar chapa</button><h3 class="section-title">Pagamento</h3><div class="grid three">${field('discount','Desconto em R$','number','0','required min="0" step="0.01"')}${field('deposit','Entrada em R$','number','0','required min="0" step="0.01"')}${field('installments','Número de parcelas','number','1','required min="1" step="1"')}${select('payment','Forma de pagamento *',['PIX','Dinheiro','Boleto','Cartão','Transferência','A combinar'].map(v=>`<option>${v}</option>`).join(''))}<label class="field">Informações de pagamento<textarea name="paymentNotes" rows="2" maxlength="1000"></textarea></label><label class="field">Observações<textarea name="notes" rows="2" maxlength="2000"></textarea></label></div><div id="order-total" class="subtotal"></div><p>Salvar o orçamento não altera o estoque. Confirme o pedido na lista para efetuar a baixa e depois imprima.</p>`,d=>{commit(C.order(state,{...d,items:collectItems(),discount:C.money(d.discount),deposit:C.money(d.deposit)}));toast('Orçamento salvo. Confirme o pedido para baixar o estoque.');},'Salvar orçamento');
  editingOrder=true;$('#add-item').onclick=addItem;$('#form [name=discount]').oninput=updateTotal;addItem();
};
$('#orders').onclick=e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.print)return printOrder(button.dataset.print);
  if(button.dataset.confirm){const o=state.orders.find(o=>o.id===button.dataset.confirm);modal('Confirmar pedido',`<p>O pedido <strong>#${String(o.number).padStart(4,'0')}</strong> para <strong>${esc(o.client.name)}</strong> vai retirar do estoque:</p><ul>${o.items.map(i=>`<li>${i.qty} × ${esc(i.description)}</li>`).join('')}</ul><p>Total a pagar: <strong>${brl(o.total-o.discount)}</strong></p><p class="hint">Confirme depois de conferir os dados. Cancelamentos e devoluções aguardam definição das regras nesta versão.</p>`,()=>{commit(C.confirm(state,o.id));toast('Pedido confirmado. Estoque atualizado. Use Imprimir para emitir o documento.');},'Confirmar e baixar estoque');}
};
function printOrder(id){
  const o=state.orders.find(o=>o.id===id),c=o.client,paid=o.total-o.discount,balance=paid-o.deposit;
  const line=(label,value)=>`<div><strong>${label}:</strong> ${esc(value)||'—'}</div>`;
  $('#print-area').innerHTML=`<div class="print-header"><div><h1>PONTUAL</h1><p>Estoque e pedidos de chapas</p></div><div><h2>${o.status==='Confirmado'?'PEDIDO':'ORÇAMENTO'} #${String(o.number).padStart(4,'0')}</h2><p>${esc(date(o.date))}</p></div></div><div class="print-box print-grid">${line('Cliente',c.name)}${line('CPF / CNPJ',c.document)}${line('RG / IE',c.rg)}${line('Data de nascimento',c.birthdate?date(c.birthdate):'')}${line('Responsável',c.responsible)}${line('Endereço',[c.address,c.number].filter(Boolean).join(', '))}${line('Complemento',c.complement)}${line('Bairro',c.neighborhood)}${line('Condomínio',c.condominium)}${line('Cidade / UF',[c.city,c.state].filter(Boolean).join(' / '))}${line('CEP',c.zip)}${line('Telefone',c.phone)}${line('Telefone comercial',c.businessPhone)}${line('Celular',c.cellphone)}${line('E-mail',c.email)}${line('Vendedor',o.seller)}</div><h2>CHAPAS</h2><table><thead><tr><th>Item</th><th>Descrição</th><th>Quantidade</th><th>Preço unitário</th><th>Total</th></tr></thead><tbody>${o.items.map((i,n)=>`<tr><td>${n+1}</td><td>${esc(i.description)}</td><td>${i.qty}</td><td>${brl(i.price)}</td><td>${brl(i.price*i.qty)}</td></tr>`).join('')}</tbody></table><div class="print-total">Total a pagar: ${brl(paid)}</div><div class="print-box print-grid">${line('Total geral',brl(o.total))}${line('Desconto',brl(o.discount))}${line('Entrada',brl(o.deposit))}${line('Saldo restante',brl(balance))}${line('Número de parcelas',o.installments)}${line('Valor por parcela (aprox.)',brl(Math.round(balance/o.installments)))}${line('Forma de pagamento',o.payment)}${line('Prazo de entrega',o.delivery?date(o.delivery):'A combinar')}</div><div class="print-box">${line('Informações sobre pagamento',o.paymentNotes)}${line('Observações',o.notes)}</div><div class="print-signatures"><div>${esc(c.name)}<br>Cliente</div><div>Pontual<br>Responsável</div></div><p class="print-foot">Modelo provisório para avaliação. Não é documento fiscal. Dados da empresa e layout serão ajustados ao PDF de referência.</p>`;
  window.print();
}
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pontual-estoque-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Arquivo de dados exportado.');};
$('#demo').onclick=()=>{
  if(state.products.length||state.orders.length)return toast('Demonstração disponível somente com o cadastro vazio.');
  let s=JSON.parse(JSON.stringify(state));for(const [color,thickness,brand,grade,price,qty] of [['Branco TX',15,'Marca Exemplo','Primeira',180,10],['Branco TX',15,'Marca Exemplo','PD',150,4],['Louro freijó',18,'Marca Exemplo','LD',210,6]]){s=C.product(s,{color,thickness,brand,grade,price});s=C.entry(s,{productId:s.products.at(-1).id,qty,reason:'DADOS FICTÍCIOS PARA DEMONSTRAÇÃO'});}
  s.revision=state.revision;s=C.client(s,{name:'Cliente de demonstração',city:'Cidade exemplo'});commit(s);toast('Dados fictícios carregados para experimentar.');
};
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{state=JSON.parse(e.newValue);render();if($('#modal').open){closeModal();toast('Dados atualizados em outra aba. Reabra o formulário para continuar.');}}catch{toast('Não foi possível atualizar os dados.');}}});
render();
