import os
import json
from typing import Dict, Any, List, Optional

def load_json(filepath: str) -> Any:
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def find_leaf_nodes(tree: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    leaves = []
    def dfs(node):
        # 叶子节点定义：没有 children 字段，或 children 字段为空列表
        if not isinstance(node, dict):
            return
        if 'children' not in node or not node['children'] or (isinstance(node['children'], list) and len(node['children']) == 0):
            leaves.append(node)
        else:
            for child in node['children']:
                dfs(child)
    for item in tree:
        dfs(item)
    return leaves

def find_json_file(id_or_parent_id: str, tree: List[Dict[str, Any]], law_jsons_dir: str) -> Optional[str]:
    # 先用 id 查找 json 文件
    file_path = os.path.join(law_jsons_dir, f"{id_or_parent_id}.json")
    if os.path.exists(file_path):
        return file_path
    # 找不到再用 parentId 递归查找
    def find_node_by_id(node_list, target_id):
        for node in node_list:
            if str(node.get('id')) == str(target_id):
                return node
            if 'children' in node:
                result = find_node_by_id(node['children'], target_id)
                if result:
                    return result
        return None
    parent_node = find_node_by_id(tree, id_or_parent_id)
    if parent_node and parent_node.get('parentId'):
        return find_json_file(parent_node['parentId'], tree, law_jsons_dir)
    return None

def find_record_by_id(json_data: Any, target_id: str) -> Optional[Dict[str, Any]]:
    # target_id 可能为 int 或 str，需统一类型
    if isinstance(json_data, list):
        for item in json_data:
            if str(item.get('id')) == str(target_id):
                return item
    elif isinstance(json_data, dict):
        if str(json_data.get('id')) == str(target_id):
            return json_data
    return None

def set_lawWebContent_for_leaves(tree_json_path: str, law_jsons_dir: str, output_path: str):
    tree = load_json(tree_json_path)

    def fill_law_content(node, tree):
        if not isinstance(node, dict):
            return
        # 叶子节点定义：没有 children 字段，或 children 字段为空列表
        if 'children' not in node or not node['children'] or (isinstance(node['children'], list) and len(node['children']) == 0):
            id_ = node.get('id')
            parent_id = node.get('parentId')
            # 优先用 id 查找 json 文件，找不到再用 parentId 递归
            law_file = find_json_file(id_, tree, law_jsons_dir)
            if not law_file:
                law_file = find_json_file(parent_id, tree, law_jsons_dir)
            if law_file:
                law_data = load_json(law_file)
                record = find_record_by_id(law_data, id_)
                if record and 'lawWebContent' in record:
                    node['lawWebContent'] = record['lawWebContent']
                else:
                    # 特殊情况：没有 id=该节点 的记录，合并所有条目的 lawWebContent
                    if isinstance(law_data, list):
                        merged_content = '\n\n'.join([str(item.get('lawWebContent','')) for item in law_data if 'lawWebContent' in item])
                        node['lawWebContent'] = merged_content if merged_content else None
                    else:
                        node['lawWebContent'] = None
            else:
                node['lawWebContent'] = None
        else:
            for child in node.get('children', []):
                fill_law_content(child, tree)

    # 递归处理整个树
    if isinstance(tree, dict) and 'data' in tree:
        for item in tree['data']:
            fill_law_content(item, tree['data'])
    elif isinstance(tree, list):
        for item in tree:
            fill_law_content(item, tree)
    # Save updated tree
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Set lawWebContent for leaf nodes.")
    parser.add_argument('--tree', required=True, help='Path to listTreeLawWebCategoryByParam-response.json')
    parser.add_argument('--law_jsons', required=True, help='Path to law_jsons directory')
    parser.add_argument('--output', required=True, help='Path to output json file')
    args = parser.parse_args()
    set_lawWebContent_for_leaves(args.tree, args.law_jsons, args.output)
