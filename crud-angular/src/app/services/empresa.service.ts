import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, first, tap } from 'rxjs';
import { Empresa } from '../models/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly API = '/api/empresas'; 

  constructor(private httpClient: HttpClient) { }

  list(): Observable<Empresa[]> {
    return this.httpClient.get<Empresa[]>(this.API)
      .pipe(
        first(), 
        tap(empresas => console.log('Empresas recebidas:', empresas)) 
      );
  }

  loadById(id: number): Observable<Empresa> {
    return this.httpClient.get<Empresa>(`${this.API}/${id}`);
  }

  save(record: Partial<Empresa>): Observable<Empresa> {
    console.log('Salvando empresa:', record);
    if (record.id) {
      
      console.log('Atualizando empresa ID:', record.id);
      return this.update(record as Empresa); 
    }
    
    console.log('Criando nova empresa');
    return this.create(record);
  }

  private create(record: Partial<Empresa>): Observable<Empresa> {
    return this.httpClient.post<Empresa>(this.API, record).pipe(first());
  }

  private update(record: Empresa): Observable<Empresa> {
    return this.httpClient.put<Empresa>(`${this.API}/${record.id}`, record).pipe(first());
  }

  remove(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`).pipe(first());
  }

  addFornecedorToEmpresa(empresaId: number, fornecedorId: number): Observable<any> {
   
    return this.httpClient.put<any>(`${this.API}/${empresaId}/fornecedores/${fornecedorId}`, {});
  }

  removeFornecedorFromEmpresa(empresaId: number, fornecedorId: number): Observable<any> {
  
    return this.httpClient.delete<any>(`${this.API}/${empresaId}/fornecedores/${fornecedorId}`);
  }

}