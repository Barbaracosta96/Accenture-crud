export interface Fornecedor {
  id: number; 
  tipoPessoa: 'PF' | 'PJ'; 
  cnpjCpf: string; 
  nome: string;
  email?: string;
  cep: string;
  rg?: string; 
  dataNascimento?: Date | string; 
  empresaIds?: number[];
}

export interface EnderecoCep {
  cep: string;
  uf: string; 
  cidade: string;
  bairro: string;
  logradouro: string;
  
}