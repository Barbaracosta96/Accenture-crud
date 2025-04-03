import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar'; 

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        RouterTestingModule, 
        MatToolbarModule,    
        AppComponent         
    ],
}).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'crud-angular'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('crud-angular'); 
  });

  it('should render the main title in the toolbar', () => { 
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); 
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-toolbar span')?.textContent).toContain('CRUD Angular');
  });

  it('should render navigation links', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('mat-toolbar a[mat-button]');
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links[0]?.textContent).toContain('Empresas');
    expect(links[1]?.textContent).toContain('Fornecedores');
  });
});