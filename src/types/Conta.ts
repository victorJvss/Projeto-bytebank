import { Transacao } from "./Transacao.js";
import { TipoTransacao } from "./TipoTransacao.js";
import { GrupoTransacao } from "./grupoTransacao.js";
import { FaturaTotal} from "./ResumoDeValores.js";

let saldo: number = JSON.parse(localStorage.getItem("saldo")) || 0

let transacoes:Transacao[] = JSON.parse(localStorage.getItem("transacao"), (key: string,value: string) => {
    
    if(key == "data"){
        return new Date(value);
    }

    return value;
}) || []

function debitar(valor:number): void{
    
    if(valor <= 0){
        throw new Error("O valor tem que ser maior que zero!");
    }

    if(valor > saldo){
        throw new Error("Saldo insuficiente!");
    }
    
    saldo -= valor

    localStorage.setItem("saldo", JSON.stringify(saldo));
}

function depositar(valor:number): void{
    
    if(valor <= 0){
        throw new Error("O valor tem que ser maior que zero!");
    }
    
    saldo += valor

    localStorage.setItem("saldo", JSON.stringify(saldo));
}

const Conta = {
    getSaldo() {
        return saldo;
    },

    getDataAcesso(): Date {
        return new Date();
    },

    getResumoFaturas(transacao:Transacao): void{
        
        let todasAsFaturas: FaturaTotal = JSON.parse(localStorage.getItem("todosOsDepositos"));

        const verificaTransacaoDeposito: number = transacao.tipoTransacao === TipoTransacao.DEPOSITO? transacao.valor : 0 
        const verificaTransacaoTransacao: number = transacao.tipoTransacao === TipoTransacao.TRANSFERENCIA? transacao.valor : 0   
        const verificaTransacaoPagamentoBoleto: number = transacao.tipoTransacao === TipoTransacao.PAGAMENTO_BOLETO? transacao.valor : 0 
        
        if(todasAsFaturas ==null){
            const bancoDeDadosResumoFaturas: FaturaTotal ={
                registrosDepositos:verificaTransacaoDeposito,
                registrosTransferencias:verificaTransacaoTransacao,
                registrosPagamentoBoleto:verificaTransacaoPagamentoBoleto
            }  
        
            localStorage.setItem("todosOsDepositos",JSON.stringify(bancoDeDadosResumoFaturas));
        }else{
            let todasAsFaturas: FaturaTotal = JSON.parse(localStorage.getItem("todosOsDepositos"));

           if(transacao.tipoTransacao === TipoTransacao.DEPOSITO){
                const somaDepositos: number = todasAsFaturas.registrosDepositos += transacao.valor
                
                const bancoDeDadosResumoFaturas: FaturaTotal ={
                    registrosDepositos:somaDepositos,
                    registrosTransferencias:todasAsFaturas.registrosTransferencias,
                    registrosPagamentoBoleto:todasAsFaturas.registrosPagamentoBoleto
                }  

                localStorage.setItem("todosOsDepositos",JSON.stringify(bancoDeDadosResumoFaturas));
           }else if(transacao.tipoTransacao == TipoTransacao.TRANSFERENCIA){

            const somaTransaferencias: number = todasAsFaturas.registrosTransferencias += transacao.valor
                
            const bancoDeDadosResumoFaturas: FaturaTotal ={
                registrosDepositos:todasAsFaturas.registrosDepositos,
                registrosTransferencias:somaTransaferencias,
                registrosPagamentoBoleto:todasAsFaturas.registrosPagamentoBoleto
            }  

            localStorage.setItem("todosOsDepositos",JSON.stringify(bancoDeDadosResumoFaturas));

           }else if(transacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO){
            const somaPagamentoDeBoletos: number = todasAsFaturas.registrosPagamentoBoleto += transacao.valor
                
            const bancoDeDadosResumoFaturas: FaturaTotal ={
                registrosDepositos:todasAsFaturas.registrosDepositos,
                registrosTransferencias:todasAsFaturas.registrosTransferencias,
                registrosPagamentoBoleto:somaPagamentoDeBoletos
            }  

            localStorage.setItem("todosOsDepositos",JSON.stringify(bancoDeDadosResumoFaturas));
           }
            
       

        }
        
         


    

    },  

    getGrupoTransacoes(): GrupoTransacao[]{
        const listaDeGrupos:GrupoTransacao[] = [];
        const listaDeTransacoes:Transacao[] = structuredClone(transacoes);
        const ordenaTransacoes:Transacao[] = listaDeTransacoes.sort((t1,t2) => t2.data.getTime() - t1.data.getTime());
        let labelAtualGrupoTransacao: string = ""

        for(let transacaoAtual of ordenaTransacoes){
            let labelGrupoTransacao:string = transacaoAtual.data.toLocaleDateString("pt-br", {month:"long", year:"numeric"});

            if(labelAtualGrupoTransacao !== labelGrupoTransacao){
                labelAtualGrupoTransacao = labelGrupoTransacao
                
                listaDeGrupos.push({
                    label:labelGrupoTransacao,
                    transacoes:[]
                })
            }

            listaDeGrupos.at(-1).transacoes.push(transacaoAtual);
        }

       return listaDeGrupos 
    },

    registrarTransacao(novaTransacao: Transacao): void {
        if (novaTransacao.tipoTransacao == TipoTransacao.DEPOSITO) {
            depositar(novaTransacao.valor);
        } 
        else if (novaTransacao.tipoTransacao == TipoTransacao.TRANSFERENCIA) {
            debitar(novaTransacao.valor);
            novaTransacao.valor *= -1;
        } 
        else if(novaTransacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO){
            debitar(novaTransacao.valor);
            novaTransacao.valor *= -1;
        }else{
            alert("Tipo de Transação é inválido!");
            return;
        }
        
        Conta.getResumoFaturas(novaTransacao)
        transacoes.push(novaTransacao);
        localStorage.setItem("transacao", JSON.stringify(transacoes));
    }
}

export default Conta;