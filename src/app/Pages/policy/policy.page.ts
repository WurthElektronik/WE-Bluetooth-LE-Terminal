import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';


@Component({
  selector: 'app-policy',
  templateUrl: './policy.page.html',
  styleUrls: ['./policy.page.scss'],
})
export class PolicyPage implements OnInit {
  firsttime = true;
  constructor(private router: Router) { }

  async ngOnInit() {
    const { value } =  await Preferences.get({ key: 'firsttime' });
    this.firsttime = (value == null);
  }

  async acceptclick(){
    await Preferences.set({
      key: 'firsttime',
      value: 'no',
    });
    this.router.navigate(
      ['/tabs/scan'], { replaceUrl: true }
    );
  }

}
