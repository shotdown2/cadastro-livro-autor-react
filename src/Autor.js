import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import SubmitCustomizado from './componentes/SubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

export class FormularioAutor extends Component{

  constructor(){
    super();
    this.state = {nome:'', email:'', senha:''};
    this.enviaForm = this.enviaForm.bind(this);
  }

  enviaForm(evento){
    evento.preventDefault();

    $.ajax({
      url:"http://localhost:8080/api/autores",
      contentType: 'application/json',
      type: 'post',
      data: JSON.stringify({nome:this.state.nome, email:this.state.email, senha:this.state.senha}),
      success:function(novaListagem){
        PubSub.publish('atualiza-lista-autores', novaListagem);
        this.setState({nome:'', email:'', senha:''});
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

  salvaAlteracao(nomeInput, evento){
    var campoSendoAlterado = {};
    campoSendoAlterado[nomeInput] = evento.target.value;
    this.setState(campoSendoAlterado);
  }

  render(){
    return(
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
          <InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} onChange={this.salvaAlteracao.bind(this, 'nome')} label="Nome"/>
          <InputCustomizado id="email" type="email" name="email" value={this.state.email} onChange={this.salvaAlteracao.bind(this, 'email')} label="Email"/>
          <InputCustomizado id="senha" type="password" name="senha" value={this.state.senha} onChange={this.salvaAlteracao.bind(this, 'senha')} label="Senha"/>

          <SubmitCustomizado label="Gravar" />
        </form>
      </div>
    );
  }
}

export class TabelaAutores extends Component{

  render(){
    return(
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.lista.map(function(autor){
                return(
                  <tr key={autor.id}>
                    <td>{autor.nome}</td>
                    <td>{autor.email}</td>
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

export default class AutorBox extends Component{


    constructor(){
      super();
      this.state = {lista : []};
    }

    componentDidMount(){
      $.ajax({
        url:"http://localhost:8080/api/autores",
        dataType: 'json',
        success:function(resposta){
          this.setState({lista:resposta});
        }.bind(this)
      });

      PubSub.subscribe('atualiza-lista-autores', function(topico, novaLista){
        this.setState({lista: novaLista});
      }.bind(this));
    }

  render(){
    return(
      <div>
        <div className="header">
          <h1>Cadastro de autores</h1>
        </div>
        <div className="content" id="content">
          <FormularioAutor/>
          <TabelaAutores lista={this.state.lista}/>
        </div>
      </div>
    );
  }
}
