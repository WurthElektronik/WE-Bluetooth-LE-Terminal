import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EncodingType } from '../../Encoders/EncodingType';
import { Encoder } from 'src/app/Encoders/Encoder';
import { ASCII_printable } from 'src/app/Encoders/ASCII_printable';
import { ASCII } from 'src/app/Encoders/ASCII';
import { HEX } from 'src/app/Encoders/HEX';

@Component({
  selector: 'app-select-encoding',
  templateUrl: './select-encoding.component.html',
  styleUrls: ['./select-encoding.component.scss'],
})
export class SelectEncodingComponent implements OnInit {
  public selectedencoding:Encoder;
  public selectedencodingstring:string;
  public encodingtypes = Object.keys(EncodingType).map(key => EncodingType[key]).filter(value => typeof value === 'string') as string[];
  public only_printable_ascii:boolean = false;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.selectedencodingstring = this.selectedencoding.getEncodingTypeString();
    this.only_printable_ascii = (this.selectedencoding == ASCII_printable);
  }

  encodingselected(){
    switch(this.selectedencodingstring)
    {
      default:
      case EncodingType[EncodingType.ASCII]:
        this.selectedencoding = this.only_printable_ascii ? ASCII_printable : ASCII;
        break;
      case EncodingType[EncodingType.HEX]:
        this.selectedencoding = HEX;
        break;
    }

    return this.modalCtrl.dismiss({selectedencoding: this.selectedencoding}, 'confirm');
  }

}
