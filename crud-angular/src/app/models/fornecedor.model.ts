export interface Fornecedor {
  cnpjCpf: string;
  nome: string;
  email: string;
  cep: string;
  rg?: string; // Optional for individuals
  dataNascimento?: Date; // Optional for individuals
}
