import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { ViewDataComponent } from './views/view-data/view-data.component';


const routes: Routes = [
	{path: "", component: HomeComponent },
	{path: "view-data", component: ViewDataComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
