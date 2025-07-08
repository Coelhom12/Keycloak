Projeto Keycloak com React + Flask

Este projeto demonstra uma aplicação completa utilizando autenticação via Keycloak, com um frontend em React e backend em Flask. A autenticação é feita usando o protocolo OpenID Connect, e o controle de acesso é baseado em roles atribuídas no Keycloak.

Problema conhecido (audience token)

O usuário é autenticado com sucesso e um token é gerado corretamente pelo Keycloak. No entanto:

O campo aud (audience) do token JWT vem como:

"aud": "account"

Mas o esperado seria:

"aud": "frontend-client"

Solução adotada:

A validação do token no back-end foi adaptada para utilizar o campo azp (Authorized Party), que está correto:

if payload.get("azp") != EXPECTED_CLIENT_ID:
    return jsonify({'error': 'ClientId não autorizado'}), 403

Como rodar o projeto

git clone https://github.com/Coelhom12/Keycloak.git
cd Keycloak
docker-compose up --build

Acesse:

Keycloak: http://localhost:8080

Frontend: http://localhost:3000

Backend (API): http://localhost:5000

Configuração do Keycloak passo a passo

1. Acesse o painel de administração

URL: http://localhost:8080

Usuário: admin

Senha: admin

2. Crie um Realm

Nome: demo

3. Crie um Client

Nome: frontend-client

Tipo: Public

Habilite o fluxo Standard Flow

Desabilite Direct Access Grants e Service Accounts

URI de redirecionamento: http://localhost:3000/*

4. Crie um Usuário

Nome de usuário: usuario

Senha: 123456

Marque como "Email verificado"

5. Crie Roles (funções)

No client frontend-client, crie as seguintes roles:

get-role

post-role

delete-role

(essas roles serão usadas para controle de permissão no back-end)

6. Atribua as roles ao usuário

No usuário usuario, vá em Role Mappings

Selecione Client Roles > frontend-client

Adicione as roles get-role, post-role, delete-role

Estrutura

/frontend: React + Keycloak (login e CRUD com token)

/backend: Flask + JWT + Verificação via Keycloak

/docker-compose.yml: Sobe todos os serviços simultaneamente

Observações

Certifique-se de que o client_id configurado no React (keycloak.js) seja igual ao client configurado no Keycloak.

O back-end espera o azp igual ao client_id para autenticar a requisição.

Caso deseje validar também roles, extraia-as do campo realm_access.roles no payload JWT.

Autor

Gabriel Coelho - @Coelhom12
