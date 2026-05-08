import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {RouterModule, Routes} from "@angular/router";
import {NotFoundComponent} from "./errors/not-found/not-found.component";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {ErrorInterceptor} from "./errorHandler/error.interceptor";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCardModule} from "@angular/material/card";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatNativeDateModule} from "@angular/material/core";
import {MatChipsModule} from "@angular/material/chips";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatStepperModule} from "@angular/material/stepper";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatToolbarModule} from "@angular/material/toolbar";
import {AgGridModule} from "ag-grid-angular";
import {ErrorDialogComponent} from "./errorHandler/error-dialog/error-dialog.component";
import { ShortNumberPipe } from './utilities/short-number.pipe';
import { DateFormatPipe } from './utilities/date-format.pipe';
import { JoinComponent } from './features/join/join.component';
import { ExistingGroupDialogComponent } from './dialogs/existing-group-dialog/existing-group-dialog.component';
import { CreateGroupDialogComponent } from './dialogs/create-group-dialog/create-group-dialog.component';
import { SelectUserComponent } from './features/select-user/select-user.component';
import { PaginationPipe } from './pipes/pagination.pipe';
import { MobileSelectUserComponent } from './features/select-user/mobile-select-user/mobile-select-user.component';
import { PcSelectUserComponent } from './features/select-user/pc-select-user/pc-select-user.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MobileFooterComponent } from './layout/footer/mobile-footer/mobile-footer.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { PcHeaderComponent } from './layout/pc-header/pc-header.component';
import { PcFooterComponent } from './layout/footer/pc-footer/pc-footer.component';
import { MobileTopnavComponent } from './layout/navbar/mobile-topnav/mobile-topnav.component';
import { PcSidenavComponent } from './layout/navbar/pc-sidenav/pc-sidenav.component';
import { FooterComponent } from './layout/footer/footer.component';

// Set up the routes.  If no route is found, then take the user to the NotFoundComponent
// NOTE:  The **ORDER** of these routes matters.  The NotFoundComponent should always be last
const appRoutes: Routes = [
  { path:  '',                                component: JoinComponent, },
  { path:  'page/select-user/:groupId',       component: SelectUserComponent, },
  { path:  'page/dashboard/:groupId',         component: DashboardComponent, },
  { path:  '**',                              component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ErrorDialogComponent,
    ShortNumberPipe,
    DateFormatPipe,
    JoinComponent,
    ExistingGroupDialogComponent,
    CreateGroupDialogComponent,
    SelectUserComponent,
    PaginationPipe,
    MobileSelectUserComponent,
    PcSelectUserComponent,
    DashboardComponent,
    MobileFooterComponent,
    NavbarComponent,
    PcHeaderComponent,
    PcFooterComponent,
    MobileTopnavComponent,
    PcSidenavComponent,
    FooterComponent,
  ],
  imports: [
    AgGridModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
