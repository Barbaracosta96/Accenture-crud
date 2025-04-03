import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core'; 
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, tap, debounceTime, distinctUntilChanged, first, takeUntil } from 'rxjs/operators';

import { FornecedorService } from '../../../services/fornecedor.service';
import { CepService } from '../../../services/cep.service';
import { FormUtilsService } from '../../../services/form-utils.service';
import { Fornecedor, EnderecoCep } from '../../../models/fornecedor.model';



export function idadeMinimaValidator(idadeMinima: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; 
    }
    const dataNascimento = new Date(control.value);
    const dataLimite = new Date();
    dataLimite.setFullYear(dataLimite.getFullYear() - idadeMinima);

    return dataNascimento > dataLimite ? { idadeMinima: { requiredAge: idadeMinima, actualAge: calculateAge(dataNascimento) } } : null;
  };
}

function calculateAge(birthday: Date): number {
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs); 
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

@Component({
  selector: 'app-fornecedor-form',
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
    MatSelectModule,      
    MatDatepickerModule,  
    MatIconModule,
    MatProgressSpinnerModule,
    NgxMaskDirective,
    NgxMaskPipe
  ],
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter() 
  ],
  templateUrl: './fornecedor-form.component.html',
  styleUrls: ['./fornecedor-form.component.scss']
})
export class FornecedorFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  cepLoading: boolean = false;
  cepValid: boolean | null = null;
  fornecedorId: number | null = null;
  empresaParana: boolean = false; 
  enderecoEmpresa: EnderecoCep | null = null;

  cpfCnpjMask = '000.000.000-00||00.000.000/0000-00';

  private formBuilder = inject(FormBuilder);
  private fornecedorService = inject(FornecedorService);
  private cepService = inject(CepService);
  public formUtils = inject(FormUtilsService); 
  private snackBar = inject(MatSnackBar);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>(); 


  constructor() { }

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditModeAndLoadData();
    this.setupConditionalValidators();
    this.setupCepValidation();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      tipoPessoa: ['PF', Validators.required],
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]], 
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}\-\d{3}$/)]],
      rg: ['', [Validators.maxLength(20)]], 
      dataNascimento: [null], 
    });
  }

  private setupConditionalValidators(): void {
    const tipoPessoaControl = this.form.get('tipoPessoa');
    const cnpjCpfControl = this.form.get('cnpjCpf');
    const rgControl = this.form.get('rg');
    const dataNascimentoControl = this.form.get('dataNascimento');

    tipoPessoaControl?.valueChanges
      .pipe(
        startWith(tipoPessoaControl.value), 
        takeUntil(this.destroy$) 
      )
      .subscribe(tipo => {
        cnpjCpfControl?.clearValidators(); 
        rgControl?.clearValidators();
        dataNascimentoControl?.clearValidators();

        if (tipo === 'PF') {
          cnpjCpfControl?.setValidators([Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)]); // Validador CPF
          rgControl?.setValidators([Validators.required, Validators.maxLength(20)]);
          dataNascimentoControl?.setValidators([Validators.required]);
          this.updateValidatorsForParana();

        } else if (tipo === 'PJ') {
          cnpjCpfControl?.setValidators([Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/)]); // Validador CNPJ
          rgControl?.setValue(null);
          dataNascimentoControl?.setValue(null);
        }

        cnpjCpfControl?.updateValueAndValidity();
        rgControl?.updateValueAndValidity();
        dataNascimentoControl?.updateValueAndValidity();
      });
  }

  private updateValidatorsForParana(): void {
    const dataNascimentoControl = this.form.get('dataNascimento');
    const tipoPessoa = this.form.get('tipoPessoa')?.value;

    if (tipoPessoa === 'PF' && this.empresaParana && dataNascimentoControl) {
      dataNascimentoControl.addValidators(idadeMinimaValidator(18));
      console.log("Validador de idade mínima (18) ADICIONADO.");
    } else if (dataNascimentoControl) {
       dataNascimentoControl.removeValidators(idadeMinimaValidator(18));
       console.log("Validador de idade mínima REMOVIDO.");
       if (tipoPessoa === 'PF') {
           dataNascimentoControl.addValidators(Validators.required);
       }
    }
     dataNascimentoControl?.updateValueAndValidity(); 
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
                    return this.cepService.consultarCep(cepLimpo).pipe(catchError(() => of(null)));
                } else {
                    return of(null);
                }
            }),
            takeUntil(this.destroy$)
        ).subscribe((endereco: EnderecoCep | null) => {
            this.cepLoading = false;
            if (endereco && endereco.cep) {
                this.cepValid = true;
                cepControl.setErrors(null);
            } else if (cepControl.value && cepControl.value.replace(/\D/g, '').length === 8) {
                this.cepValid = false;
                cepControl.setErrors({ ...cepControl.errors, cepInvalidoApi: true });
            }
        });
    }
}


  private checkEditModeAndLoadData(): void {
    this.route.params.pipe(
      map(params => params['id']),
      tap(id => {
          this.isEditMode = !!id;
          this.fornecedorId = id ? +id : null;
          console.log('Modo Edição Fornecedor:', this.isEditMode, 'ID:', this.fornecedorId);
      }),
      switchMap(id => {
        if (id) {
          this.isLoading = true;
          return this.fornecedorService.loadById(+id).pipe(
             catchError(error => {
               this.onError('Erro ao carregar dados do fornecedor.');
               this.router.navigate(['/fornecedores']);
               return of(null);
             })
          );
        }
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe((fornecedor: Fornecedor | null) => {
       this.isLoading = false;
       if (fornecedor) {
         console.log('Dados carregados (Fornecedor):', fornecedor);
         if (fornecedor.dataNascimento && typeof fornecedor.dataNascimento === 'string') {
            fornecedor.dataNascimento = new Date(fornecedor.dataNascimento + 'T00:00:00'); 
         }
         this.form.patchValue(fornecedor);
         this.form.get('tipoPessoa')?.updateValueAndValidity();
         this.form.get('cep')?.updateValueAndValidity();
       }
    });
  }

  onSubmit(): void {
    if (this.form.valid && this.cepValid === true) {
      this.isLoading = true;
      let formData = { ...this.form.value }; 

      if (formData.dataNascimento instanceof Date) {
         formData.dataNascimento = formData.dataNascimento.toISOString().split('T')[0];
      }

      console.log('Formulário Fornecedor válido, enviando:', formData);

      this.fornecedorService.save(formData).pipe(
        first(),
        catchError(error => {
          this.onError(this.isEditMode ? 'Erro ao atualizar fornecedor.' : 'Erro ao salvar fornecedor.');
          console.error("Erro no save (Fornecedor):", error);
          this.isLoading = false;
           if (error.status === 400) {
                if (error.error?.message?.includes('CPF/CNPJ já cadastrado')) {
                    this.form.get('cnpjCpf')?.setErrors({ duplicado: true });
                } else if (error.error?.message?.includes('menor de idade')) {
                    this.form.get('dataNascimento')?.setErrors({ backendIdadeInvalida: true });
                } else if (error.error?.message?.includes('CEP inválido')) {
                    this.form.get('cep')?.setErrors({ cepInvalidoApi: true });
                    this.cepValid = false;
                }
           }
          return of(null);
        })
      ).subscribe((result: Fornecedor | null) => {
         this.isLoading = false;
         if (result) {
           const successMessage = this.isEditMode ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!';
           this.onSuccess(successMessage);
           this.router.navigate(['/fornecedores']);
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
      console.warn('Formulário Fornecedor inválido:', this.form.value, 'Erros:', this.form.errors, 'CEP Válido API:', this.cepValid);
    }
  }

  onCancel(): void {
    this.location.back();
  }

  private onError(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 5000, verticalPosition: 'top' });
  }

  private onSuccess(message: string): void {
    this.snackBar.open(message, '', { duration: 3000, verticalPosition: 'top' });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);

    if (fieldName === 'cnpjCpf') {
        if (control?.hasError('pattern')) {
            const tipo = this.form.get('tipoPessoa')?.value;
            return tipo === 'PF' ? 'Formato de CPF inválido (XXX.XXX.XXX-XX).' : 'Formato de CNPJ inválido (XX.XXX.XXX/XXXX-XX).';
        }
        if (control?.hasError('duplicado')) {
            return 'Este CPF/CNPJ já está cadastrado.';
        }
    }
     if (fieldName === 'cep' && control?.hasError('cepInvalidoApi')) {
        return 'CEP inválido ou não encontrado.';
    }
    if (fieldName === 'cep' && control?.hasError('pattern')) {
        return 'Formato de CEP inválido (XXXXX-XXX).';
    }
     if (fieldName === 'dataNascimento') {
        if (control?.hasError('idadeMinima')) {
            const requiredAge = control.getError('idadeMinima').requiredAge;
            return `O fornecedor deve ter no mínimo ${requiredAge} anos.`;
        }
        if (control?.hasError('matDatepickerParse')) {
            return 'Formato de data inválido.';
        }
         if (control?.hasError('backendIdadeInvalida')) {
            return 'Validação de idade falhou no servidor (menor de idade?).';
        }
    }
     if (fieldName === 'email' && control?.hasError('email')) {
        return 'Formato de e-mail inválido.';
     }

    return this.formUtils.getErrorMessage(this.form, fieldName);
  }
}