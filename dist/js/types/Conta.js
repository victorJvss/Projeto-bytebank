import { TipoTransacao } from "./TipoTransacao.js";
let saldo = JSON.parse(localStorage.getItem("saldo")) || 0;
let transacoes = JSON.parse(localStorage.getItem("transacao"), (key, value) => {
    if (key == "data") {
        return new Date(value);
    }
    return value;
}) || [];
function debitar(valor) {
    if (valor <= 0) {
        throw new Error("O valor tem que ser maior que zero!");
    }
    if (valor > saldo) {
        throw new Error("Saldo insuficiente!");
    }
    saldo -= valor;
    localStorage.setItem("saldo", JSON.stringify(saldo));
}
function depositar(valor) {
    if (valor <= 0) {
        throw new Error("O valor tem que ser maior que zero!");
    }
    saldo += valor;
    localStorage.setItem("saldo", JSON.stringify(saldo));
}
const Conta = {
    getSaldo() {
        return saldo;
    },
    getDataAcesso() {
        return new Date();
    },
    getResumoFaturas(transacao) {
        let todasAsFaturas = JSON.parse(localStorage.getItem("todosOsDepositos"));
        const verificaTransacaoDeposito = transacao.tipoTransacao === TipoTransacao.DEPOSITO ? transacao.valor : 0;
        const verificaTransacaoTransacao = transacao.tipoTransacao === TipoTransacao.TRANSFERENCIA ? transacao.valor : 0;
        const verificaTransacaoPagamentoBoleto = transacao.tipoTransacao === TipoTransacao.PAGAMENTO_BOLETO ? transacao.valor : 0;
        if (todasAsFaturas == null) {
            const bancoDeDadosResumoFaturas = {
                registrosDepositos: verificaTransacaoDeposito,
                registrosTransferencias: verificaTransacaoTransacao,
                registrosPagamentoBoleto: verificaTransacaoPagamentoBoleto
            };
            localStorage.setItem("todosOsDepositos", JSON.stringify(bancoDeDadosResumoFaturas));
        }
        else {
            let todasAsFaturas = JSON.parse(localStorage.getItem("todosOsDepositos"));
            if (transacao.tipoTransacao === TipoTransacao.DEPOSITO) {
                const somaDepositos = todasAsFaturas.registrosDepositos += transacao.valor;
                const bancoDeDadosResumoFaturas = {
                    registrosDepositos: somaDepositos,
                    registrosTransferencias: todasAsFaturas.registrosTransferencias,
                    registrosPagamentoBoleto: todasAsFaturas.registrosPagamentoBoleto
                };
                localStorage.setItem("todosOsDepositos", JSON.stringify(bancoDeDadosResumoFaturas));
            }
            else if (transacao.tipoTransacao == TipoTransacao.TRANSFERENCIA) {
                const somaTransaferencias = todasAsFaturas.registrosTransferencias += transacao.valor;
                const bancoDeDadosResumoFaturas = {
                    registrosDepositos: todasAsFaturas.registrosDepositos,
                    registrosTransferencias: somaTransaferencias,
                    registrosPagamentoBoleto: todasAsFaturas.registrosPagamentoBoleto
                };
                localStorage.setItem("todosOsDepositos", JSON.stringify(bancoDeDadosResumoFaturas));
            }
            else if (transacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO) {
                const somaPagamentoDeBoletos = todasAsFaturas.registrosPagamentoBoleto += transacao.valor;
                const bancoDeDadosResumoFaturas = {
                    registrosDepositos: todasAsFaturas.registrosDepositos,
                    registrosTransferencias: todasAsFaturas.registrosTransferencias,
                    registrosPagamentoBoleto: somaPagamentoDeBoletos
                };
                localStorage.setItem("todosOsDepositos", JSON.stringify(bancoDeDadosResumoFaturas));
            }
        }
    },
    getGrupoTransacoes() {
        const listaDeGrupos = [];
        const listaDeTransacoes = structuredClone(transacoes);
        const ordenaTransacoes = listaDeTransacoes.sort((t1, t2) => t2.data.getTime() - t1.data.getTime());
        let labelAtualGrupoTransacao = "";
        for (let transacaoAtual of ordenaTransacoes) {
            let labelGrupoTransacao = transacaoAtual.data.toLocaleDateString("pt-br", { month: "long", year: "numeric" });
            if (labelAtualGrupoTransacao !== labelGrupoTransacao) {
                labelAtualGrupoTransacao = labelGrupoTransacao;
                listaDeGrupos.push({
                    label: labelGrupoTransacao,
                    transacoes: []
                });
            }
            listaDeGrupos.at(-1).transacoes.push(transacaoAtual);
        }
        return listaDeGrupos;
    },
    registrarTransacao(novaTransacao) {
        if (novaTransacao.tipoTransacao == TipoTransacao.DEPOSITO) {
            depositar(novaTransacao.valor);
        }
        else if (novaTransacao.tipoTransacao == TipoTransacao.TRANSFERENCIA) {
            debitar(novaTransacao.valor);
            novaTransacao.valor *= -1;
        }
        else if (novaTransacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO) {
            debitar(novaTransacao.valor);
            novaTransacao.valor *= -1;
        }
        else {
            alert("Tipo de Transação é inválido!");
            return;
        }
        Conta.getResumoFaturas(novaTransacao);
        transacoes.push(novaTransacao);
        localStorage.setItem("transacao", JSON.stringify(transacoes));
    }
};
export default Conta;
