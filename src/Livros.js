import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import SubmitCustomizado from './componentes/SubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioApiLivros extends Component{

  constructor(){
    super();
    this.state = {titulo:'', preco:'', autorId:''};
    this.enviaForm = this.enviaForm.bind(this);
    this.setTitulo = this.setTitulo.bind(this);
    this.setPreco = this.setPreco.bind(this);
    this.setAutorId = this.setAutorId.bind(this);
  }

  enviaForm(evento){
    evento.preventDefault();

    $.ajax({
      url:"http://localhost:8080/api/livros",
      contentType: 'application/json',
      type: 'post',
      data: JSON.stringify({titulo:this.state.titulo, preco:this.state.preco, autorId:this.state.autorId}),
      success:function(novaListagem){
        PubSub.publish('atualiza-lista-api-livros', novaListagem);
        this.setState({titulo:'', preco:'', autorId:''});
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

  setTitulo(evento){
    this.setState({titulo:evento.target.value});
  }

  setPreco(evento){
    this.setState({preco:evento.target.value});
  }

  setAutorId(evento){
    this.setState({autorId:evento.target.value});
  }

  render(){
    return(
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
          <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Titulo"/>
          <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preco"/>
          <div className="pure-control-group">
            <label htmlFor="autorId">Autor</label>
          <select id="autorId" name="autorId" onChange={this.setAutorId}>
            <option value="">Selecione o autor</option>
            {
              this.props.autores.map(function(autor){
                return <option value={autor.id}>{autor.nome}</option>
              })
            }
          </select>
          </div>
          <SubmitCustomizado label="Gravar" />
        </form>
      </div>
    );
  }
}

class TabelaApiLivros extends Component{

  render(){
    return(
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Preco</th>
              <th>Autor</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.lista.map(function(apiLivros){
                return(
                  <tr key={apiLivros.id}>
                    <td>{apiLivros.titulo}</td>
                    <td>{apiLivros.preco}</td>
                    <td>{apiLivros.autor.nome}</td>
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

export default class ApiLivrosBox extends Component{
  constructor(){
    super();
    this.state = {lista : [], autores:[]};
  }

  componentDidMount(){
    $.ajax({
      url:"http://localhost:8080/api/livros",
      dataType: 'json',
      success:function(resposta){
        this.setState({lista:resposta});
      }.bind(this)
    });

    $.ajax({
      url:"http://localhost:8080/api/autores",
      dataType: 'json',
      success:function(resposta){
        this.setState({autores:resposta});
      }.bind(this)
    });

    PubSub.subscribe('atualiza-lista-api-livros', function(topico, novaLista){
      this.setState({lista: novaLista});
    }.bind(this));
  }

  render(){
    return(
      <div>
        <div className="header">
          <h1>Cadastro de Livros</h1>
        </div>
        <div className="content" id="content">
          <FormularioApiLivros autores={this.state.autores}/>
          <TabelaApiLivros lista={this.state.lista}/>
        </div>
      </div>
    );
  }

}
