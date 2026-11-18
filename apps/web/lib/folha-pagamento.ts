export type CategoriaFolha='comissionados'|'efetivos'|'contratados';
export const folhaCategorias:{slug:CategoriaFolha;nome:string;descricao:string}[]=[
 {slug:'comissionados',nome:'Comissionados',descricao:'Consulte as folhas de pagamento de cargos comissionados.'},
 {slug:'efetivos',nome:'Efetivos',descricao:'Consulte as folhas de pagamento dos servidores efetivos.'},
 {slug:'contratados',nome:'Contratados',descricao:'Consulte as folhas de pagamento dos servidores contratados.'}
];
export const meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
