import json,pprint,urllib2

#Sorts json files to d3 friendly format


nodes = []
links = []

def sorter(th_id,structure):
    url_data = urllib2.urlopen("http://inphodev.cogs.indiana.edu:8085/thinker/"+str(th_id)+"/graph.json")
    json_data = url_data.read()
    data = json.loads(json_data)
    sorted_data = data["responseData"]["result"][structure]
    pprint.pprint(nodes)
    ante_dictionary = {}
    ID = sorted_data.pop(0)
    ante_dictionary["node"] = ID["ante"]
    nodes.append(ante_dictionary)
    
    for x in sorted_data:
        cons_dictionary = {}
        links_dictionary = {}
        cons_dictionary["node"] = x["cons"]
        nodes.append(cons_dictionary)
        links_dictionary["source"] = nodes.index(ante_dictionary)
        links_dictionary["value"] = x["weight"]
        if nodes.index(cons_dictionary) > 99:
            break
        else:
            links_dictionary["target"] = nodes.index(cons_dictionary)
        links.append(links_dictionary)


#Work in progress
def expander():
    for x in nodes[1:10]:
        ID = x.nodes.index(x)
        sorter(ID["node"],"tt_out")


sorter(3646,"tt_out")
expander()


#Write nodes and links to JSON file
with open("d3_thinker.json","w") as new_file:
    json.dump({"nodes": nodes[:100], "links": links[:100]}, new_file)

    
