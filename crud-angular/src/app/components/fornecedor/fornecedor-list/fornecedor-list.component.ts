import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; 
import { MatSort, MatSortModule } from '@angular/material/sort'; 
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms'; 
import { Observable, of, Subject, merge } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Fornecedor } from '../../../models/fornecedor.model';
import { FornecedorService } from '../../../services/fornecedor.service';

@Component({
  selector: 'app-fornecedor-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    MatTableModule,
    MatPaginatorModule, 
    MatSortModule,   
    MatCardModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule, 
    MatInputModule,     
    RouterLink,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './fornecedor-list.component.html',
  styleUrls: ['./fornecedor-list.component.scss']
})
export class FornecedorListComponent implements OnInit {

  dataSource: MatTableDataSource<Fornecedor> = new MatTableDataSource<Fornecedor>([]);
  displayedColumns: string[] = ['nome', 'cnpjCpf', 'email', 'cep', 'actions'];
  isLoading: boolean = true;
  filterForm: FormGroup;
  totalItems: number = 0; 

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private fornecedorService = inject(FornecedorService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>(); 

  constructor() {
     this.filterForm = this.fb.group({
       nome: [''],
       cnpjCpf: ['']
     });
  }

  ngOnInit(): void {
    this.loadFornecedores();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
     if (this.sort && this.paginator) {
        this.sort.sortChange
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page, this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()))
            .pipe(
                startWith({}), 
                switchMap(() => {
                    this.isLoading = true;
                    const filters = this.filterForm.value;
                    return this.fornecedorService.list(filters.nome || undefined, filters.cnpjCpf || undefined)
                        .pipe(catchError(() => of([])));
                }),
                tap(data => {
                    this.isLoading = false;
                    this.dataSource.data = data;
                    
                }),
                takeUntil(this.destroy$)
            ).subscribe();
     } else {
         this.loadFornecedores();
     }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFornecedores(nome?: string, cnpjCpf?: string): void {
    this.isLoading = true;
    this.fornecedorService.list(nome, cnpjCpf)
      .pipe(
          first(), 
          catchError(error => {
            console.error('Erro ao carregar fornecedores:', error);
            this.onError('Erro ao carregar fornecedores.');
            return of([]);
          }),
          takeUntil(this.destroy$)
      )
      .subscribe((fornecedores) => {
        this.isLoading = false;
        this.dataSource.data = fornecedores;
       
        if (!this.dataSource.paginator && this.paginator) {
           this.dataSource.paginator = this.paginator;
        }
        if (!this.dataSource.sort && this.sort) {
           this.dataSource.sort = this.sort;
        }
        console.log('Fornecedores carregados:', fornecedores);
      });
  }

  setupFilters(): void {

  }

  clearFilters(): void {
      this.filterForm.reset({ nome: '', cnpjCpf: '' });
  }


  onError(errorMessage: string) {
    this.isLoading = false; 
    this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
  }

  onAdd(): void {
    this.router.navigate(['/fornecedores/new']);
  }

  onEdit(fornecedor: Fornecedor): void {
    this.router.navigate(['/fornecedores/edit', fornecedor.id]);
  }

  onDelete(fornecedor: Fornecedor): void {
    
        this.isLoading = true; 
        this.fornecedorService.remove(fornecedor.id).pipe(
          first(),
          catchError(err => {
             this.onError('Erro ao remover fornecedor.');
             console.error(err);
             this.isLoading = false;
             return of(null); 
          }),
          takeUntil(this.destroy$)
        ).subscribe(response => {
           if (response !== null) { 
             this.snackBar.open('Fornecedor removido com sucesso!', 'X', {
               duration: 3000,
               verticalPosition: 'top'
             });
              this.loadFornecedores(this.filterForm.value.nome, this.filterForm.value.cnpjCpf); 
           }
        });
 
  }
}