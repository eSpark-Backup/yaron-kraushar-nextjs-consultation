import os
import re
import ast

def should_ignore(path):
    ignore_dirs = {'.next', '.vscode', 'archive', 'node_modules'}
    return any(d in path.split(os.sep) for d in ignore_dirs)

def remove_comments_and_whitespace(content, file_ext):
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    return ' '.join(lines) if file_ext in {'.css', '.scss'} else ''.join(lines)

class VariableRenamer(ast.NodeTransformer):
    def __init__(self):
        self.counter = 0
        self.var_map = {}

    def visit_FunctionDef(self, node):
        self.var_map.clear()
        self.generic_visit(node)
        return node

    def visit_Name(self, node):
        if isinstance(node.ctx, ast.Store):
            if node.id not in self.var_map:
                self.var_map[node.id] = f'{"abcdefghijklmnopqrstuvwxyz"[self.counter % 26]}{self.counter // 26 or ""}'
                self.counter += 1
            node.id = self.var_map[node.id]
        elif isinstance(node.ctx, ast.Load) and node.id in self.var_map:
            node.id = self.var_map[node.id]
        return node

def minimize_variables(content):
    try:
        tree = ast.parse(content)
        transformer = VariableRenamer()
        minimized_tree = transformer.visit(tree)
        return ast.unparse(minimized_tree)
    except:
        return content

def collect_code(root_dir, output_file):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, _, files in os.walk(root_dir):
            if should_ignore(root):
                continue
            
            for file in files:
                if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html')):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, root_dir)
                    _, file_ext = os.path.splitext(file)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            content = remove_comments_and_whitespace(content, file_ext)
                            if file_ext in {'.js', '.jsx', '.ts', '.tsx'}:
                                content = minimize_variables(content)
                            outfile.write(f"{relative_path}:{content}")
                    except Exception as e:
                        outfile.write(f"{relative_path}:Error:{str(e)}")

if __name__ == "__main__":
    root_directory = "."
    output_file = "aggregated_code.txt"
    
    collect_code(root_directory, output_file)
    print(f"Code aggregation complete. Output saved to {output_file}")