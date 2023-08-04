import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-whatsnew',
  templateUrl: './whatsnew.page.html',
  styleUrls: ['./whatsnew.page.scss'],
})
export class WhatsnewPage implements OnInit {
  public whatsnew;
  constructor(private http: HttpClient, private translate: TranslateService) { }

  ngOnInit() {

    let path = 'assets/whatsnew/whatsnew.html';
    this.http.get(path, {responseType: "text"}).subscribe(
    data => {
      this.whatsnew = data;
    });

  }

}
