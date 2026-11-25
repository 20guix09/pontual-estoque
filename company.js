// Identidade comercial informada pelo usuário; dados cadastrais transcritos do PDF.
// A logo original do PDF está em assets/logo-company.jpeg, sem redesenho.
(function(root){
  const company={
    brand:'IVG Company',
    legalName:'EVG COMPANY COMÉRCIO DE PRODUTOS LTDA',
    cnpj:'46.364.747/0001-20',
    stateRegistration:'90946301-74',
    address:'Rua Carlos Clementino Moreira, 221',
    neighborhood:'Pq. Industrial Kiugo Takata',
    zip:'86042-370',
    phone:'(43) 3037-8952',
    email:'contato@marcenariaexpress.com',
    website:'www.marcenariaexpress.com',
    logo:'assets/logo-company.jpeg'
  };
  if(typeof module!=='undefined')module.exports=company;else root.IvgCompany=company;
})(globalThis);
