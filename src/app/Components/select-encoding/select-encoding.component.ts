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

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  encodingselected(encoding: string){
    return this.modalCtrl.dismiss(EncodingType[encoding], 'confirm');
  }

}
