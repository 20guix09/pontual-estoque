(function(root){
  'use strict';
  const classes = ['Primeira','PD','LD'];
  const materials = ['MDF','MDP','Aglomerado','Compensado','Outro'];
  const copy = s => JSON.parse(JSON.stringify(s));
  const uid = () => globalThis.crypto.randomUUID();
  function text(v,label){const s=String(v??'').trim();if(!s)throw Error('Preencha '+label+'.');return s;}
  function integer(v,label,min=0){const n=Number(v);if(!Number.isSafeInteger(n)||n<min)throw Error(label+' inválido.');return n;}
  function money(v){const n=Number(String(v).replace(',','.'));if(!Number.isFinite(n)||n<0||n>100000000)throw Error('Valor inválido.');return Math.round(n*100);}
  const label = p => `${p.material||'Material a conferir'} · ${p.color} · ${p.thickness} mm · ${p.brand} · ${p.grade}`;
  const empty = () => ({version:2,revision:0,products:[],clients:[],orders:[],movements:[]});
  function migrate(s){
    if(!s||![1,2].includes(s.version)||!['products','clients','orders','movements'].every(k=>Array.isArray(s[k]))||!Number.isSafeInteger(s.revision))throw Error('Dados incompatíveis.');
    const n=copy(s);n.version=2;
    for(const p of n.products)p.material=p.material||'A conferir';
    return n;
  }
  function product(s,data,id){
    const n=copy(s),previous=id?n.products.find(p=>p.id===id):null;
    if(id&&!previous)throw Error('Chapa não encontrada.');
    const p={id:previous?.id||uid(),material:text(data.material,'o tipo de material'),color:text(data.color,'a cor'),brand:text(data.brand,'a marca'),thickness:Number(data.thickness),grade:data.grade,price:money(data.price),stock:previous?.stock||0};
    if(!materials.includes(p.material))throw Error('Selecione o tipo de material.');
    if(!Number.isFinite(p.thickness)||p.thickness<=0||p.thickness>100)throw Error('Espessura inválida.');
    if(!classes.includes(p.grade))throw Error('Classificação inválida.');
    if(previous?.stock>0){
      const fields=['color','brand','thickness','grade'];
      if(fields.some(k=>previous[k]!==p[k])||(previous.material!=='A conferir'&&previous.material!==p.material))throw Error('Com saldo positivo, altere somente o preço ou informe o material que estava A conferir.');
    }
    if(n.products.some(x=>x.id!==p.id&&x.material===p.material&&x.color.toLowerCase()===p.color.toLowerCase()&&x.brand.toLowerCase()===p.brand.toLowerCase()&&x.thickness===p.thickness&&x.grade===p.grade))throw Error('Essa combinação já está cadastrada.');
    if(previous)n.products[n.products.findIndex(x=>x.id===id)]=p;else n.products.push(p);return n;
  }
  function entry(s,data){
    const n=copy(s),p=n.products.find(p=>p.id===data.productId);if(!p)throw Error('Selecione uma chapa cadastrada.');
    const qty=integer(data.qty,'Quantidade',1), reason=text(data.reason,'a origem ou observação');
    if(!Number.isSafeInteger(p.stock+qty))throw Error('Quantidade acima do limite.');
    p.stock+=qty;n.movements.unshift({id:uid(),productId:p.id,description:label(p),qty,kind:'Entrada',reason,date:new Date().toISOString()});return n;
  }
  function client(s,data){const n=copy(s),p={...data,id:uid(),name:text(data.name,'o nome do cliente')};n.clients.push(p);return n;}
  function discountFor(total,kind,value){
    integer(total,'Total');if(!['amount','percent'].includes(kind))throw Error('Tipo de desconto inválido.');
    const hundredths=money(value);
    if(kind==='percent'&&hundredths>10000)throw Error('O percentual não pode superar 100%.');
    // Em percentual, hundredths representa pontos-base: 1,46% = 146 / 10000.
    const amount=kind==='percent'?Number((BigInt(total)*BigInt(hundredths)+5000n)/10000n):hundredths;
    if(amount>total)throw Error('O desconto supera o total.');
    return amount;
  }
  function paymentPlan(balance,count){
    integer(balance,'Saldo');integer(count,'Parcelas',1);if(count>360)throw Error('Informe até 360 parcelas.');
    const base=Math.floor(balance/count),extra=balance%count;
    return Array.from({length:count},(_,i)=>base+(i<extra?1:0));
  }
  function order(s,data){
    const n=copy(s),c=n.clients.find(c=>c.id===data.clientId);if(!c)throw Error('Selecione um cliente cadastrado.');
    if(!Array.isArray(data.items)||!data.items.length)throw Error('Inclua ao menos uma chapa.');
    const seen=new Set(),items=data.items.map(i=>{const p=n.products.find(x=>x.id===i.productId);if(!p)throw Error('Chapa não encontrada.');if(seen.has(p.id))throw Error('Agrupe a quantidade da mesma chapa em uma linha.');seen.add(p.id);return {productId:p.id,description:label(p),qty:integer(i.qty,'Quantidade',1),price:integer(i.price,'Preço')};});
    const total=items.reduce((a,i)=>a+i.qty*i.price,0);if(!Number.isSafeInteger(total))throw Error('Total acima do limite.');
    const discount=data.discountKind?discountFor(total,data.discountKind,data.discountValue):integer(data.discount,'Desconto'),deposit=integer(data.deposit,'Entrada');if(discount>total)throw Error('O desconto supera o total.');if(deposit>total-discount)throw Error('A entrada supera o valor a pagar.');
    const date=text(data.date,'a data');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date)))throw Error('Data inválida.');
    const installments=integer(data.installments,'Parcelas',1);paymentPlan(total-discount-deposit,installments);
    const number=n.orders.reduce((max,o)=>Math.max(max,o.number),0)+1;
    const o={id:uid(),number,status:'Orçamento',client:copy(c),seller:text(data.seller,'o vendedor'),date,delivery:data.delivery||'A combinar',payment:text(data.payment,'a forma de pagamento'),paymentNotes:data.paymentNotes||'',notes:data.notes||'',items,total,discount,discountKind:data.discountKind||'amount',discountValue:data.discountKind?money(data.discountValue)/100:discount/100,deposit,installments};
    n.orders.unshift(o);return n;
  }
  function confirm(s,id){
    const n=copy(s),o=n.orders.find(o=>o.id===id);if(!o)throw Error('Pedido não encontrado.');
    if(o.status!=='Orçamento')throw Error('Esse pedido já foi confirmado. Reimprimir não gera outra baixa.');
    for(const i of o.items){const p=n.products.find(p=>p.id===i.productId);if(!p||p.stock<i.qty)throw Error('Estoque insuficiente: '+i.description+'.');}
    for(const i of o.items){const p=n.products.find(p=>p.id===i.productId);p.stock-=i.qty;n.movements.unshift({id:uid(),productId:p.id,description:i.description,qty:-i.qty,kind:'Pedido',reason:'Pedido nº '+o.number,date:new Date().toISOString()});}
    o.status='Confirmado';o.confirmedAt=new Date().toISOString();return n;
  }
  const api={classes,materials,empty,migrate,product,entry,client,order,confirm,label,money,discountFor,paymentPlan};
  if(typeof module!=='undefined')module.exports=api;else root.IvgCore=api;
})(globalThis);
