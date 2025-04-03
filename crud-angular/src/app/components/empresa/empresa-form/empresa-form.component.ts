import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms'; // Importar tipos de validação
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { EmpresaService } from '../../../services/empresa.service';
import { CepService } from '../../../services/cep.service'; 
import { FormUtilsService } from '../../../services/form-utils.service';
import { Empresa } from '../../../models/empresa.model';
import { EnderecoCep } from '../../../models/fornecedor.model';
import { catchError, map, switchMap, tap, of, timer, debounceTime, distinctUntilChanged, first } from 'rxjs'; // Importar operadores RxJS

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule, 
    NgxMaskDirective,
    NgxMaskPipe
  ],
  providers: [
    provideNgxMask() 
  ],
  templateUrl: './empresa-form.component.html',
  styleUrls: ['./empresa-form.component.scss']
})
export class EmpresaFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  cepLoading: boolean = false; 
  cepValid: boolean | null = null; 
  empresaId: number | null = null;

  private formBuilder = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private cepService = inject(CepService);
  public formUtils = inject(FormUtilsService);
  private snackBar = inject(MatSnackBar);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditModeAndLoadData(); 
    this.setupCepValidation(); 
  }

  private initializeForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      nomeFantasia: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}\-\d{3}$/)]],
     
    });
  }

  private setupCepValidation(): void {
    const cepControl = this.form.get('cep');
    if (cepControl) {
      cepControl.valueChanges.pipe(
        debounceTime(700),
        distinctUntilChanged(),
      
        map(cep => cep?.replace(/\D/g, '')),
       
        tap(cepLimpo => {
       
          this.cepValid = null;
          this.cepLoading = false;
          cepControl.setErrors({ ...cepControl.errors, cepInvalidoApi: null });
          cepControl.updateValueAndValidity({ emitEvent: false }); 
        }),
       
        switchMap(cepLimpo => {
          if (cepLimpo && cepLimpo.length === 8) {
             this.cepLoading = true;
      
             return this.cepService.consultarCep(cepLimpo).pipe(
               catchError(err => {
                 console.error("Erro no catchError do consultarCep:", err);
                 return of(null); 
               })
             );
          } else {
           
             return of(null);
          }
        }),
  
      ).subscribe((endereco: EnderecoCep | null) => {
         this.cepLoading = false;
         if (endereco && endereco.cep) {
           this.cepValid = true;
           cepControl.setErrors(null); 
           console.log('CEP válido:', endereco);
         } else if (cepControl.value && cepControl.value.replace(/\D/g, '').length === 8) {
           
           this.cepValid = false;
           cepControl.setErrors({ ...cepControl.errors, cepInvalidoApi: true }); 
           console.warn('CEP não encontrado ou inválido pela API:', cepControl.value);
         }
       
      });
    }
  }


  private checkEditModeAndLoadData(): void {
    this.route.params.pipe(
     
      map(params => params['id']),
      
      tap(id => {
          this.isEditMode = !!id;
          this.empresaId = id ? +id : null; 
          console.log('Modo Edição:', this.isEditMode, 'ID:', this.empresaId);
      }),
      
      switchMap(id => {
        if (id) {
          this.isLoading = true; 
          return this.empresaService.loadById(+id).pipe(
             catchError(error => {
               this.onError('Erro ao carregar dados da empresa para edição.');
               this.router.navigate(['/empresas']);
               return of(null); 
             })
          );
        }
        return of(null); 
      })
    ).subscribe((empresa: Empresa | null) => {
       this.isLoading = false; 
       if (empresa) {
         console.log('Dados carregados para edição:', empresa);
         this.form.patchValue(empresa); /
         this.form.get('cep')?.updateValueAndValidity();
       }
    });
  }

  onSubmit(): void {
    if (this.form.valid && this.cepValid === true) { 
      this.isLoading = true; 
      const formData = this.form.value;
      console.log('Formulário válido, enviando:', formData);

      this.empresaService.save(formData).pipe(
        first(),
        catchError(error => {
          this.onError(this.isEditMode ? 'Erro ao atualizar empresa.' : 'Erro ao salvar empresa.');
          console.error("Erro no save:", error);
          this.isLoading = false; 
          if (error.status === 400 && error.error?.message?.includes('CNPJ já cadastrado')) {
              this.form.get('cnpj')?.setErrors({ cnpjDuplicado: true });
          } else if (error.status === 400 && error.error?.message?.includes('CEP inválido')) {
              this.form.get('cep')?.setErrors({ cepInvalidoApi: true }); 
          }
          return of(null); 
        })
      ).subscribe((result: Empresa | null) => {
         this.isLoading = false; 
         if (result) { 
           const successMessage = this.isEditMode ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!';
           this.onSuccess(successMessage);
           this.router.navigate(['/empresas']); 
         }
      });

    } else {
      this.isLoading = false; 
      this.formUtils.validateAllFormFields(this.form);
       if (this.cepValid === false) {
           this.snackBar.open('CEP inválido ou não encontrado. Verifique o CEP informado.', 'Fechar', { duration: 4000 });
           this.form.get('cep')?.markAsTouched(); 
           this.form.get('cep')?.setErrors({ ...this.form.get('cep')?.errors, cepInvalidoApi: true });
       } else if (this.form.get('cep')?.valid && this.cepValid === null && !this.cepLoading) {
            this.snackBar.open('Aguarde a validação do CEP ou verifique o valor digitado.', 'Fechar', { duration: 4000 });
            this.form.get('cep')?.markAsTouched();
       } else {
           this.snackBar.open('Por favor, corrija os erros no formulário.', 'Fechar', { duration: 4000 });
       }
      console.warn('Formulário inválido:', this.form.value, 'Erros:', this.form.errors, 'CEP Válido API:', this.cepValid);
    }
  }

  onCancel(): void {
    console.log('Operação cancelada');
    this.location.back(); 
  }

  
  private onError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  private onSuccess(message: string): void {
    this.snackBar.open(message, '', { 
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);

   
    if (control?.hasError('cnpjDuplicado')) {
        return 'Este CNPJ já está cadastrado.';
    }
    
    if (fieldName === 'cep' && control?.hasError('cepInvalidoApi')) {
        return 'CEP inválido ou não encontrado.';
    }
    
    if (control?.hasError('pattern')) {
        if (fieldName === 'cnpj') return 'Formato de CNPJ inválido (XX.XXX.XXX/XXXX-XX).';
        if (fieldName === 'cep') return 'Formato de CEP inválido (XXXXX-XXX).';
    }

    return this.formUtils.getErrorMessage(this.form, fieldName);
  }
}