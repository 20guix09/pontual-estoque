(function(root){
  'use strict';
  const C=typeof module!=='undefined'?require('./core.js'):root.IvgCore;
  const company=typeof module!=='undefined'?require('./company.js'):root.IvgCompany;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brl=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const date=d=>String(d||'').split('-').reverse().join('/');
  function installmentText(o){
    const plan=C.paymentPlan(o.total-o.discount-o.deposit,o.installments);
    if(plan[0]===plan.at(-1))return brl(plan[0]);
    const higher=plan.filter(n=>n===plan[0]).length;
    return `${higher} × ${brl(plan[0])} + ${plan.length-higher} × ${brl(plan.at(-1))}`;
  }
  function render(o,withValues=true){
    const c=o.client,paid=o.total-o.discount,quantity=o.items.reduce((sum,i)=>sum+i.qty,0);
    const row=(label,value,span=1)=>`<td class="contract-label">${esc(label)}:</td><td colspan="${span}" class="contract-value">${esc(value)}</td>`;
    const discountPercent=o.discountKind==='percent'?o.discountValue:(o.total?o.discount/o.total*100:0);
    const discountText=`${brl(o.discount)} (${Number(discountPercent).toLocaleString('pt-BR',{maximumFractionDigits:2})}%)`;
    return `<div class="contract-header"><img src="${esc(company.logo)}" alt="${esc(company.brand)}"><div><strong>${esc(company.address)}</strong><br>${esc(company.neighborhood)}<br>${esc(company.website)}<br>TELEFONE: ${esc(company.phone)}<br>CEP: ${esc(company.zip)}<br>${esc(company.email)}</div><div><strong>${esc(company.legalName)}</strong><br>CNPJ: ${esc(company.cnpj)}<br>IE: ${esc(company.stateRegistration)}</div></div>
    <h1 class="contract-title">${o.status==='Confirmado'?'CONTRATO / PEDIDO':'ORÇAMENTO'}</h1>
    <table class="contract-client"><colgroup><col style="width:14%"><col style="width:26%"><col style="width:11%"><col style="width:23%"><col style="width:12%"><col style="width:14%"></colgroup><tbody>
    <tr>${row('CLIENTE',c.name,3)}${row('Nº',String(o.number).padStart(4,'0')+'/'+String(o.date).slice(0,4))}</tr>
    <tr>${row('CPF / CNPJ',c.document)}${row('RG / IE',c.rg)}${row('DATA NASC.',date(c.birthdate))}</tr>
    <tr>${row('CEP',c.zip)}${row('RESPONSÁVEL',c.responsible,3)}</tr>
    <tr>${row('END. ENTREGA',[c.address,c.number].filter(Boolean).join(', '),5)}</tr>
    <tr>${row('COMPLEMENTO',c.complement)}${row('BAIRRO',c.neighborhood,3)}</tr>
    <tr>${row('CONDOMÍNIO',c.condominium)}${row('CIDADE',c.city)}${row('ESTADO',c.state)}</tr>
    <tr>${row('END. ADICIONAL',c.additionalAddress,5)}</tr>
    <tr>${row('FONE FIXO',c.phone)}${row('FONE COM.',c.businessPhone)}${row('CELULAR',c.cellphone)}</tr>
    <tr>${row('E-MAIL',c.email,5)}</tr><tr>${row('VENDEDOR',o.seller)}${row('DATA',date(o.date),3)}</tr></tbody></table>
    <h2 class="contract-section">CHAPAS</h2><table class="contract-items"><thead><tr><th>ITEM</th><th>DESCRIÇÃO</th><th>QTD</th>${withValues?'<th>PREÇO UNIT.</th><th>TOTAL</th>':''}</tr></thead><tbody>${o.items.map((i,n)=>`<tr><td>${n+1}</td><td>${esc(i.description)}</td><td>${i.qty}</td>${withValues?`<td>${brl(i.price)}</td><td>${brl(i.price*i.qty)}</td>`:''}</tr>`).join('')}</tbody><tfoot><tr><td colspan="2">TOTAL DE CHAPAS</td><td>${quantity}</td>${withValues?`<td>SUBTOTAL</td><td>${brl(o.total)}</td>`:''}</tr></tfoot></table>
    ${withValues?`<div class="contract-grand"><strong>TOTAL GERAL</strong><strong>${brl(o.total)}</strong></div>`:''}
    <div class="contract-notes"><strong>OBS.:</strong> ${esc(o.notes)}</div><div class="contract-delivery"><strong>PRAZO DE ENTREGA:</strong> ${esc(o.delivery||'A combinar')}</div>
    ${withValues?`<div class="contract-payment"><table><tbody><tr><th>TOTAL GERAL:</th><td>${brl(o.total)}</td></tr><tr class="discount"><th>DESCONTO:</th><td>${discountText}</td></tr><tr><th>TOTAL A PAGAR:</th><td>${brl(paid)}</td></tr><tr><th>ENTRADA:</th><td>${brl(o.deposit)}</td></tr><tr><th>SALDO RESTANTE:</th><td>${brl(paid-o.deposit)}</td></tr><tr><th>NÚMERO DE PARCELAS:</th><td>${o.installments}</td></tr><tr><th>VALOR DA PARCELA:</th><td>${esc(installmentText(o))}</td></tr><tr><th>FORMA DE PAGAMENTO:</th><td>${esc(o.payment)}</td></tr></tbody></table><div class="contract-payment-notes">${esc(o.paymentNotes)}</div></div>`:''}
    <div class="contract-signatures"><div><strong>${esc(c.name)}</strong><br>CPF / CNPJ: ${esc(c.document)}<br>CONTRATANTE</div><div><strong>${esc(company.legalName)}</strong><br>CNPJ: ${esc(company.cnpj)}<br>CONTRATADA</div></div><p class="contract-delivered">ENTREGUE DIA ______/______/_________</p><p class="contract-foot">${o.status==='Orçamento'?'ORÇAMENTO — não gera baixa no estoque.':'Pedido confirmado — a reimpressão não altera o estoque.'} Documento de avaliação, sem valor fiscal.${!withValues?' Via para separação — sem valores.':''}</p>`;
  }
  const api={render,installmentText};if(typeof module!=='undefined')module.exports=api;else root.IvgPrint=api;
})(globalThis);
