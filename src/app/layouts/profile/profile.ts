import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentProfileHeader } from '@components/profile/header/header';
import { ComponentProfileSidebar } from '@components/profile/sidebar/sidebar';

@Component({
  selector: 'layout-profile',
  imports: [ComponentProfileHeader, RouterOutlet, ComponentProfileSidebar],
  templateUrl: './profile.html',
})
export class LayoutProfile {}
