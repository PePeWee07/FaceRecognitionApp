import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacesComponent } from './faces/faces.component';

const routes: Routes = [
  {
    path: '/faces',
    component: FacesComponent
  },
  { path: '', pathMatch: 'full', component: FacesComponent },
  { path: '**', pathMatch: 'full', component: FacesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
