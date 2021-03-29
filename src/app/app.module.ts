import {NgModule} from '@angular/core';
import {BrowserModule, Title} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {
    FileSizePipe,
    TypeOfPipe,
    AgePipe,
    IsActivePipe,
    ChunkPipe,
    SortObjectCollectionPipe,
    JoinStringsPipe,
    ColumnWidthPipe
} from '@app/_pipes';

import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AppComponent} from '@app/app.component';
import {AppRoutingModule} from '@app/app-routing.module';
import {JwtInterceptor, ErrorInterceptor} from './_helpers';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoginComponent} from '@app/login';
import {
    EmbyComponent, EmbyDialogMediaItemComponent, EmbyDialogDeleteConfirmComponent,
    EmbyDialogDeleteProgressComponent, EmbyDialogMediaItemDetailComponent
} from '@app/emby/index';
import {CollapseModule} from "ngx-bootstrap/collapse";
import {ProgressbarModule} from 'ngx-bootstrap/progressbar';
import {ModalModule} from "ngx-bootstrap/modal";
import {PaginationModule} from "ngx-bootstrap/pagination";
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        FontAwesomeModule,
        BrowserAnimationsModule,
        FormsModule,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        CollapseModule.forRoot(),
        BsDropdownModule.forRoot(),
        ProgressbarModule.forRoot(),
    ],
    declarations: [
        AppComponent,
        EmbyDialogMediaItemComponent,
        EmbyDialogMediaItemDetailComponent,
        EmbyDialogDeleteConfirmComponent,
        EmbyDialogDeleteProgressComponent,
        EmbyComponent,
        LoginComponent,
        AgePipe,
        ChunkPipe,
        ColumnWidthPipe,
        FileSizePipe,
        IsActivePipe,
        JoinStringsPipe,
        SortObjectCollectionPipe,
        TypeOfPipe,
    ],
    entryComponents: [
        EmbyDialogMediaItemComponent,
        EmbyDialogMediaItemDetailComponent,
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
        Title
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
