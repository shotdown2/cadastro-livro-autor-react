import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import SubmitCustomizado from './componentes/SubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

export class FormularioLivro extends Component{

  constructor(){
    super();
    this.state = {titulo:'', preco:''};
    this.enviaFormLivro = this.enviaFormLivro.bind(this);
    this.setTitulo = this.setTitulo.bind(this);
    this.setPreco = this.setPreco.bind(this);
  }

  enviaFormLivro(eventoLivro){
    $.ajax({
      url:'http://localhost:8080/api/livros',
      contentType: 'application/json',
      type: 'post',
      data: JSON.stringify({titulo:this.state.titulo, preco:this.state.preco}),
      success:function(novaListagemLivro){
        PubSub.publish('atualiza-lista-livros', novaListagemLivro);
        this.setState({titulo:'', preco:''});
      }.bind(this),
      error:function(erro){
        if(erro.status === 400){
          new TratadorErros().publicaErros(erro.responseJSON);
        }
      },
      beforeSend: function(){
        PubSub.publish('limpa-erros', {});
      }
    });
  }

  setTitulo(eventoLivro){
    this.setState({titulo:eventoLivro.target.value});
  }

  setPreco(eventoLivro){
    this.setState({preco:eventoLivro.target.value});
  }

  render(){
    return(
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaFormLivro} method="post">
          <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Título"/>
          <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço"/>

          <SubmitCustomizado label="Gravar" />
        </form>
      </div>
    );
  }

}

export class TabelaLivros extends Component{

  render(){
    return(
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.listaLivros.map(function(livro){
                return(
                  <tr key={livro.id}>
                    <td>{livro.titulo}</td>
                    <td>{livro.preco}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}

export default class LivroBox extends Component{

  constructor(){
    super();
    this.state = {listaLivros : []};
  }

  componentWillMount(){
    $.ajax({
      url:"http://localhost:8080/api/livros",
      dataType: 'json',
      success:function(respostaLivro){
        this.setState({listaLivros:respostaLivro});
      }.bind(this)
    });

    PubSub.subscribe('atualiza-lista-livros', function(topico, novaListaLivros){
      this.setState({listaLivros: novaListaLivros});
    }.bind(this));
  }

  render(){
    return(
      <div>
        <div className="header">
          <h1>Cadastro de livros</h1>
        </div>
        <div className="content" id="content">
          <FormularioLivro/>
          <TabelaLivros listaLivros={this.state.listaLivros}/>
        </div>
      </div>
    );
  }
}
