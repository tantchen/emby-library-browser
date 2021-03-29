import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LoginComponent} from '@app/login';
import {AuthGuard} from '@app/_helpers';
import {EmbyComponent} from "@app/emby";

const routes: Routes = [
    {path: 'login', component: LoginComponent, data: {title: 'Login'}},
    {path: 'emby', component: EmbyComponent, canActivate: [AuthGuard],data: {title: 'Browser'}},

    // otherwise redirect to home
    {path: '**', redirectTo: 'emby'}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
