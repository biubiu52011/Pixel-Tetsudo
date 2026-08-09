import json
import re
from http.server import HTTPServer, BaseHTTPRequestHandler

class APIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/lines'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                with open('data/line-control.js', 'r', encoding='utf-8') as f:
                    content = f.read()
                
                ids = re.findall(r'"([A-Za-z]+)":\s*\{', content)
                
                lines = []
                for line_id in ids:
                    lines.append({
                        'id': line_id,
                        'status': {
                            'cls': 'normal',
                            'label': '正常'
                        }
                    })
                
                response = {'lines': lines}
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_error(500, f'Error: {str(e)}')
        
        elif self.path.startswith('/api/trains'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                with open('data/train-data.js', 'r', encoding='utf-8') as f:
                    content = f.read()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                self.send_error(500, f'Error: {str(e)}')
        else:
            self.send_error(404)
    
    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    port = 8080
    server = HTTPServer(('localhost', port), APIHandler)
    print(f'API server running on http://localhost:{port}')
    server.serve_forever()
