import { Component, OnInit } from '@angular/core';
import { FornecedorService } from '../services/fornecedor.service';
import { Fornecedor } from '../models/fornecedor.model';

@Component({
  selector: 'app-fornecedor',
  templateUrl: './fornecedor.component.html',
  styleUrls: ['./fornecedor.component.scss']
})
export class FornecedorComponent implements OnInit {
  fornecedores: Fornecedor[] = [];

  constructor(private fornecedorService: FornecedorService) {}

  ngOnInit(): void {
    this.getFornecedores();
  }

  getFornecedores(): void {
    this.fornecedorService.getFornecedores().subscribe(
      (data: Fornecedor[]) => {
        this.fornecedores = data;
      },
      (error) => {
        console.error('Error fetching fornecedores', error);
      }
    );
  }

  // Additional CRUD methods will go here
}
