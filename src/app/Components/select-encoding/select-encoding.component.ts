import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EncodingType } from '../../Encoders/EncodingType';

@Component({
  selector: 'app-select-encoding',
  templateUrl: './select-encoding.component.html',
  styleUrls: ['./select-encoding.component.scss'],
})
export class SelectEncodingComponent implements OnInit {
  public selectedencoding:string;
  public encodingtypes = Object.keys(EncodingType).map(key => EncodingType[key]).filter(value => typeof value === 'string') as string[];
  public only_printable_ascii:boolean;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  encodingselected(){
    return this.modalCtrl.dismiss({selectedencoding: EncodingType[this.selectedencoding], only_printable_ascii: this.only_printable_ascii}, 'confirm');
  }

}
