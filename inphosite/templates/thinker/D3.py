from json import loads,dump
from urllib2 import urlopen
from pprint import pprint

#Sorts json files to d3 friendly format


nodes = []
links = []

def sorter(th_id,structure):
    url_data = urlopen("http://inphodev.cogs.indiana.edu:8085/thinker/"+str(th_id)+"/graph.json")
    json_data = url_data.read()
    data = loads(json_data)
    sorted_data = data["responseData"]["result"][structure]
    ante_dictionary = {}
    ID = sorted_data.pop(0)
    ante_dictionary["node"] = ID["ante"]
    if ante_dictionary in nodes[:10]:
        pass
    else:
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
    print nodes        
        
#Work in progress
def expansion():
    for x in nodes[1:10]:
        sorter(x["node"],"tt_out")


#Write nodes and links to JSON file
def writer(File):
    with open(File,"w") as new_file:
        dump({"nodes": nodes[:100], "links": links[:100]}, new_file)

    
