import Conta from "../types/Conta.js";
import { GrupoTransacao } from "../types/grupoTransacao.js";
import { formatarData, formatarMoeda } from '../utils/formatters.js';

const elementoRegistroDeTransacoes: HTMLElement = document.querySelector(".extrato .registro-transacoes");

rederizaExtrato()

function rederizaExtrato():void{
    const registrosDeGrupos: GrupoTransacao[] = Conta.getGrupoTransacoes();
    
    elementoRegistroDeTransacoes.innerHTML = "";

    let htmlResgistrosElementos: string = "";
    
    for(let grupoTransacoes of registrosDeGrupos){
        let htmlElementos: string = "";
        
        for(let Transacao of grupoTransacoes.transacoes){
            htmlElementos += `
                <div class="transacao-item">
                <div class="transacao-info">
                    <span class="tipo">${Transacao.tipoTransacao}</span>
                    <strong class="valor">${formatarMoeda(Transacao.valor)}</strong>
                </div>
                <time class="data">${formatarData(Transacao.data)}</time>
                </div>
            `
        }

        htmlResgistrosElementos += `
            <div class="transacoes-group">
                <strong class="mes-group">${grupoTransacoes.label}</strong>
                ${htmlElementos}
            </div>
        `
    }

    if(htmlResgistrosElementos == ""){
        htmlResgistrosElementos = "<div> Não há transações registradas!</div>"
    }
    
    elementoRegistroDeTransacoes.innerHTML += htmlResgistrosElementos;

}

const renderizacaoExtrato = {
    atualiza(): void{
        rederizaExtrato()
    }
}

export default renderizacaoExtrato

