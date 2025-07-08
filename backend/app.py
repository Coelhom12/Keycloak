from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
from jose import jwt
import requests
import json

app = Flask(__name__)
CORS(app)

items = {}
counter = 1


KEYCLOAK_URL = "http://keycloak:8080/realms/demo"
JWKS_URL = f"{KEYCLOAK_URL}/protocol/openid-connect/certs"
EXPECTED_AUDIENCE = "frontend-client"  

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({'error': 'Token ausente'}), 401

        token_parts = auth_header.split()
        if len(token_parts) != 2 or token_parts[0] != 'Bearer':
            return jsonify({'error': 'Formato do token inválido'}), 401

        token = token_parts[1]

        try:
           
            jwks = requests.get(JWKS_URL).json()
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get('kid')

            key = next(
                (jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(k)) for k in jwks['keys'] if k['kid'] == kid),
                None
            )

            if key is None:
                return jsonify({'error': 'Chave pública não encontrada'}), 401

            payload = jwt.decode(
                token,
                key=key,
                algorithms=['RS256'],
                options={"verify_exp": True}
            )

            if payload.get("azp") != EXPECTED_AUDIENCE:
                return jsonify({'error': 'ClientId não autorizado'}), 403

            
            print("Usuário autenticado:", payload["preferred_username"])

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except Exception as e:
            print("Erro ao validar token:", str(e))
            return jsonify({'error': 'Token inválido ou erro interno'}), 401

        return f(*args, **kwargs)
    return decorated

@app.route('/items', methods=['GET'])
@token_required
def get_items():
    return jsonify(list(items.values()))

@app.route('/items', methods=['POST'])
@token_required
def create_item():
    global counter
    data = request.get_json()
    if 'name' not in data:
        return jsonify({'error': 'Campo "name" é obrigatório'}), 400
    item = {'id': counter, 'name': data['name']}
    items[counter] = item
    counter += 1
    return jsonify(item), 201

@app.route('/items/<int:item_id>', methods=['DELETE'])
@token_required
def delete_item(item_id):
    if item_id in items:
        del items[item_id]
        return '', 204
    return jsonify({'error': 'Item não encontrado'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
