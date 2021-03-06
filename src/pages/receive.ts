

import {DependencyInjectorInstance} from "../lib/numbersLab/DependencyInjector";
import {Wallet} from "../model/Wallet";
import {DestructableView} from "../lib/numbersLab/DestructableView";
import {Constants} from "../model/Constants";
import {VueVar, VueWatched} from "../lib/numbersLab/VueAnnotate";
import {CoinUri} from "../model/CoinUri";

let wallet : Wallet = DependencyInjectorInstance().getInstance(Wallet.name,'default', false);

function setTextInClipboard(inputId : string){
	/*let inputElement : HTMLInputElement = <HTMLInputElement>document.getElementById(inputId);
	let textarea : HTMLInputElement = <HTMLInputElement> document.getElementById('clipboardTextarea');
	if(textarea !== null && inputElement !== null) {
		textarea.value = inputElement.value;
		textarea.select();
	}
	try {
		document.execCommand('copy');
	} catch (err) {
	}*/
	let inputElement : HTMLInputElement = <HTMLInputElement>document.getElementById(inputId);
	if(inputElement !== null) {
		inputElement.select();
	}
	try {
		document.execCommand('copy');
	} catch (err) {
	}
}

class AccountView extends DestructableView{
	@VueVar('') rawAddress : string;
	@VueVar('') address : string;
	@VueVar('') paymentId : string;
	@VueVar('') amount : string;
	@VueVar('') recipientName : string;
	@VueVar('') txDescription : string;

	constructor(container : string){
		super(container);
		this.rawAddress = wallet.getPublicAddress();
		this.address = wallet.getPublicAddress();
		this.generateQrCode();
	}

	private stringToHex(str : string){
		let hex = '';
		for(let i=0;i<str.length;i++) {
			hex += ''+str.charCodeAt(i).toString(16);
		}
		return hex;
	}

	@VueWatched()
	amountWatch(){
		let parsedAmount = parseFloat(this.amount);
		if(!isNaN(parsedAmount)){
			if(this.amount.indexOf('.') !== -1 && (''+parsedAmount).indexOf('.') === -1)
				this.amount = ''+parsedAmount+'.';
			else
				this.amount = ''+parsedAmount;
		}else
			this.amount = '';
	}

	@VueWatched()
	paymentIdWatch(){
		if(this.paymentId !== '' && this.paymentId.length <= 8) {
			let paymentId8 = ('00000000'+this.stringToHex(this.paymentId)).slice(-16);
			console.log(paymentId8+'==>'+this.stringToHex(this.paymentId));
			this.address = cnUtil.get_account_integrated_address(wallet.getPublicAddress(), paymentId8);
		}else
			this.address = wallet.getPublicAddress();
	}

	generateQrCode(){
		let address = CoinUri.encodeTx(
			this.address,
			this.paymentId !== '' ? this.paymentId : null,
			this.amount !== '' ? this.amount : null,
			this.recipientName !== '' ? this.recipientName: null,
			this.txDescription !== '' ? this.txDescription: null,
		);

		let el = kjua({
			text: address,
			image:document.getElementById('hospQrCodeLogo'),
			size:300,
			mode:'image',
			mSize: 10,
			mPosX: 50,
			mPosY: 50,
		});
		$('#qrCodeContainer').html(el);
	}

	setInClipboard(inputId : string = 'rawAddress'){
		setTextInClipboard(inputId);
	}

}

if(wallet !== null)
	new AccountView('#app');
else
	window.location.href = '#index';