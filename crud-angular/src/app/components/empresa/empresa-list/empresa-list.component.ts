import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';

import { Empresa } from '../../../models/empresa.model';
import { EmpresaService } from '../../../services/empresa.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    RouterLink, 
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './empresa-list.component.html',
  styleUrls: ['./empresa-list.component.scss']
})
export class EmpresaListComponent implements OnInit {

  empresas$: Observable<Empresa[]> | null = null; 
  displayedColumns: string[] = ['nomeFantasia', 'cnpj', 'cep', 'actions'];

 
  private empresaService = inject(EmpresaService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  constructor() {
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.empresas$ = this.empresaService.list()
      .pipe(
        catchError(error => {
          console.error('Erro ao carregar empresas:', error);
          this.onError('Erro ao carregar empresas.');
          return of([]); 
        })
      );
  }

  onError(errorMessage: string) {
   
     console.error(errorMessage); 
     this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
  }

  onAdd(): void {
    console.log('Navegando para nova empresa');
    this.router.navigate(['/empresas/new']); 
  }

  onEdit(empresa: Empresa): void {
    console.log('Navegando para editar empresa:', empresa.id);
    this.router.navigate(['/empresas/edit', empresa.id]); 
  }

  onDelete(empresa: Empresa): void {
    console.log('Tentando deletar empresa:', empresa.id);

        this.empresaService.remove(empresa.id).subscribe({
          next: () => {
            this.snackBar.open('Empresa removida com sucesso!', 'X', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
            this.refresh(); 
          },
          error: (err) => {
            this.onError('Erro ao remover empresa.');
            console.error(err);
          }
        });
  }
}