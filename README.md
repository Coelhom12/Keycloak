Keycloak CRUD App

Este projeto é uma aplicação full-stack com autenticação e autorização utilizando o Keycloak. O front-end é feito em React, o back-end em Flask e os serviços são orquestrados via Docker Compose.

⚠️ Aviso importante:
O projeto ainda apresenta um problema com o campo aud (audience) do token JWT, que está vindo como "account" mesmo quando o client utilizado é frontend-client. Isso pode causar falha na validação do token no back-end. O campo azp é utilizado como alternativa temporária na verificação.

⚙️ Como configurar o ambiente

1. Subindo os serviços

Certifique-se de que você tem o Docker e Docker Compose instalados. Então:

git clone https://github.com/Coelhom12/Keycloak.git
cd Keycloak
docker-compose up --build

2. Acessando o Keycloak

Acesse http://localhost:8080

Login padrão:

Usuário: admin

Senha: admin

3. Configuração do Keycloak

Criar Realm

Vá em Master > Add realm

Nome: demo

Criar Client

Vá em Clients > Create

Client ID: frontend-client

Client type: Public

Root URL: http://localhost:3000

Salvar

Ajustar Configurações do Client

Aba Settings:

Valid Redirect URIs: http://localhost:3000/*

Web Origins: *

Habilitar Standard Flow Enabled

Aba Credentials: (somente para clients confidenciais)

Criar Usuário

Vá em Users > Add User

Username: usuario

Email, Nome e Sobrenome opcionais

Salvar

Aba Credentials

Criar uma senha (ex: 1234) e desmarcar Temporary

Criar Roles

Vá em Realm Roles > Add Role

Role: get-role

Role: post-role

Role: delete-role

Atribuir Roles ao Usuário

Vá em Users > selecione usuario

Aba Role Mappings

Em Available Realm Roles, selecione e adicione: get-role, post-role, delete-role

4. Testar a aplicação

Acesse http://localhost:3000

Você será redirecionado para o login do Keycloak.

Faça login com o usuário criado.

Após autenticar, o CRUD estará disponível.

📌 Problema conhecido

O campo aud (audience) retornado no token está como "account", mesmo quando o client correto (frontend-client) está sendo usado no front-end.

Isso faz com que a verificação padrão de audience no back-end falhe.

Atualmente, o código usa azp (Authorized Party) para contornar temporariamente essa limitação:

if payload.get("azp") != EXPECTED_AUDIENCE:
    return jsonify({'error': 'ClientId não autorizado'}), 401
