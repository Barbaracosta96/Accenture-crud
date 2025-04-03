import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'; // Importar

import { EmpresaService } from './empresa.service';
import { Empresa } from '../models/empresa.model';

describe('EmpresaService', () => {
  let service: EmpresaService;
  let httpTestingController: HttpTestingController; 
  const MOCK_API_URL = '/api/empresas'; 

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule 
      ],
      providers: [EmpresaService] 
    });
    service = TestBed.inject(EmpresaService);
    httpTestingController = TestBed.inject(HttpTestingController); 
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list empresas via GET', () => {
    const mockEmpresas: Empresa[] = [
      { id: 1, nomeFantasia: 'Empresa A', cnpj: '11.111.111/0001-11', cep: '11111-111' },
      { id: 2, nomeFantasia: 'Empresa B', cnpj: '22.222.222/0001-22', cep: '22222-222' }
    ];

    service.list().subscribe(empresas => {
      expect(empresas).toEqual(mockEmpresas);
      expect(empresas.length).toBe(2);
    });

    const req = httpTestingController.expectOne(MOCK_API_URL);
    expect(req.request.method).toEqual('GET');

    req.flush(mockEmpresas);
  });

  it('should save a new empresa via POST', () => {
     const newEmpresa: Partial<Empresa> = { nomeFantasia: 'Nova Empresa', cnpj: '33.333.333/0001-33', cep: '33333-333' };
     const createdEmpresa: Empresa = { id: 3, ...newEmpresa } as Empresa;

     service.save(newEmpresa).subscribe(empresa => {
        expect(empresa).toEqual(createdEmpresa);
        expect(empresa.id).toBe(3);
     });

     const req = httpTestingController.expectOne(MOCK_API_URL);
     expect(req.request.method).toEqual('POST');
     expect(req.request.body).toEqual(newEmpresa);

     req.flush(createdEmpresa); 
  });

   it('should update an existing empresa via PUT', () => {
     const updatedEmpresa: Empresa = { id: 1, nomeFantasia: 'Empresa A Editada', cnpj: '11.111.111/0001-11', cep: '11111-111' };

     service.save(updatedEmpresa).subscribe(empresa => {
        expect(empresa).toEqual(updatedEmpresa);
     });

     const req = httpTestingController.expectOne(`${MOCK_API_URL}/${updatedEmpresa.id}`);
     expect(req.request.method).toEqual('PUT');
     expect(req.request.body).toEqual(updatedEmpresa);

     req.flush(updatedEmpresa); 
  });

   it('should delete an empresa via DELETE', () => {
       const empresaIdToRemove = 1;

       service.remove(empresaIdToRemove).subscribe(response => {
           expect(response).toBeNull(); 
       });

       const req = httpTestingController.expectOne(`${MOCK_API_URL}/${empresaIdToRemove}`);
       expect(req.request.method).toEqual('DELETE');

       req.flush(null, { status: 204, statusText: 'No Content' }); 
   });



});