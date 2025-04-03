import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import { Empresa } from '../models/empresa.model';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss']
})
export class EmpresaComponent implements OnInit {
  empresas: Empresa[] = [];

  constructor(private empresaService: EmpresaService) {}

  ngOnInit(): void {
    this.getEmpresas();
  }

  getEmpresas(): void {
    this.empresaService.getEmpresas().subscribe(
      (data: Empresa[]) => {
        this.empresas = data;
      },
      (error) => {
        console.error('Error fetching empresas', error);
      }
    );
  }

  // Additional CRUD methods will go here
}
