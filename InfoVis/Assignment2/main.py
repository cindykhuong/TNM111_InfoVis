import tkinter as tk
# from tkinter import filedialog as fd
import pandas as pd
# import numpy as np
import math

# Read data from CSV file -------------------------
data1 = pd.read_csv("data1.csv")
# data = data.iloc[:, 0:3].values
data = data1.to_numpy()  # create array
objects = []  # save the points in  an array
print(data)
# ------------------------------------------------

# Colors--------------------------------
start_color = "purple"
quadrant_color = ["red", "green", "blue", "pink", "yellow"]
highlight_color = ["cyan", "yellow"]
# ---------------------------------------
# Canvas ---------------------------------
window = tk.Tk()
header_name = window.title("TNM111 - assignment 2, task 3")

canvas_width = 500
canvas_height = 500
orig_x = (canvas_width/2)
orig_y = (canvas_height/2)

# Find maximum value in dataset to create a scale factor to mame the points fit in the window
x_values = []
y_values = []
for val in data:
    x_values.append(val[0])
    y_values.append(val[1])

x_range = max(abs(min(x_values)), abs(max(x_values)))
y_range = max(abs(min(y_values)), abs(max(y_values)))

scale_factor_x = 250/x_range
scale_factor_y = 250/y_range

# Create a canvas widget
canvas = tk.Canvas(window, width=canvas_width,
                   height=canvas_height, bg="white")
# ------------------------------------------
# Used in left click
moved = False

# Create x-axis and y-axis-----------------


def create_plot():
    canvas.create_line(-orig_x, orig_y, orig_x*2,
                       orig_y, fill="black")  # x-axis
    canvas.create_line(orig_x, -orig_y, orig_x,
                       orig_y*2, fill="black")  # y-axis


# Ticks on x-axis---------------------------------------------------
    for i in range(-int(x_range), int(x_range+1), int(x_range*2/21)):  # range(25) how many ticks
        # x = (i * 25)  # space between the ticks
        x = round(orig_x + i * (250/x_range))
        canvas.create_line(x, orig_x, x, orig_y-3, fill="black", width=2)
        canvas.create_line(x, orig_x, x, orig_y+4, fill="black", width=2)
        canvas.create_text(round(x), 263, text=str(i))
    for i in range(-int(y_range), int(y_range)+1, int(y_range*2/21)):
        # y = (i * 25)  # space between the ticks
        y = round(orig_x + i * (250/x_range))
        canvas.create_line(orig_y, y, orig_y-3, y, fill="black", width=2)
        canvas.create_line(orig_y, y, orig_y+4, y, fill="black", width=2)
        canvas.create_text(263, round(y), text=str(i))

# --------------------------------------------------------------------
    # legendframe in the canvas
    legend = tk.Canvas(canvas, width=70, height=70, borderwidth=2, bg="gray")
    legend.place(x=15, y=15)

    # legend text
    legend.create_text(30, 30, text="""
        a, baz
        b, bar
        c, foo""", fill="white")

    # Shapes for different categories , shows in the legend frame-----------------------------------
    # Circle
    x = 10
    y = 20
    legend.create_oval(x, y, x+7, y+7, fill=start_color)
    # Rectangle
    x = 10
    y = 35
    legend.create_rectangle(x, y, x+7, y+7, fill=start_color)
    # Arc
    x = 6
    y = 52
    legend.create_arc(x, y, x+12, y+12, fill=start_color)
    # --------------------------------------------------------------------

# Create the different shapes for each category


def create_shapes(x, y, type, canvasName, index):
    r = 4  # radius
    x0 = 250 + x * scale_factor_x - r
    x1 = 250 + x * scale_factor_x + r
    y0 = 250 - y * scale_factor_y - r
    y1 = 250 - y * scale_factor_y + r

    if (type == "a"):
        oval = canvasName.create_oval(
            x0, y0, x1, y1, fill=start_color, tag=("current", "move_pos"))
        canvas.tag_bind(oval, '<Button-2>',
                        lambda event: rightclick(event, index))
        canvas.tag_bind(oval, '<Button-1>',
                        lambda event: leftclick(event, index))
        return oval
    elif (type == "b"):
        rect = canvasName.create_rectangle(
            x0, y0, x1, y1, fill=start_color, tag=("current", "move_pos"))
        canvas.tag_bind(rect, '<Button-2>',
                        lambda event: rightclick(event, index))
        canvas.tag_bind(rect, '<Button-1>',
                        lambda event: leftclick(event, index))
        return rect
    elif (type == "c"):
        arc = canvasName.create_arc(
            x0, y0, x1+5, y1+5, fill=start_color, tag=("current", "move_pos"))
        canvas.tag_bind(arc, '<Button-2>',
                        lambda event: rightclick(event, index))
        canvas.tag_bind(arc, '<Button-1>',
                        lambda event: leftclick(event, index))
        return arc
    elif (type == "baz"):
        oval = canvasName.create_oval(
            x0, y0, x1, y1, fill=start_color, tag=("current", "move_pos"))
        canvas.tag_bind(oval, '<Button-2>',
                        lambda event: rightclick(event, index))
        canvas.tag_bind(oval, '<Button-1>',
                        lambda event: leftclick(event, index))
        return oval
    elif (type == "bar"):
        rect = canvasName.create_rectangle(
            x0, y0, x1, y1, fill=start_color, tag=("current", "move_pos"))
        canvas.tag_bind(rect, '<Button-2>',
                        lambda event: rightclick(event, index))
        canvas.tag_bind(rect, '<Button-1>',
                        lambda event: leftclick(event, index))
        return rect
    elif (type == "foo"):
        arc = canvasName.create_arc(
            x0, y0, x1+5, y1+5, fill=start_color, tag=("current", "move_pos"))
        canvas.tag_bind(arc, '<Button-2>',
                        lambda event: rightclick(event, index))
        canvas.tag_bind(arc, '<Button-1>',
                        lambda event: leftclick(event, index))
        return arc

# Display the scatterplot which are connected to the tag current data --> give the


def display_shapes():
    index = 0
    for i in range(len(data)):
        # (x position, y position, type, canvas, index)
        # save the shapes in array object_id
        objects.append(create_shapes(
            data[i][0], data[i][1], data[i][2], canvas, index))
        index += 1

# RIGHT CLICK ------------------------------------


def rightclick(event, index):
    # Reset wehn clicking on the selected point again (check if it already has the highlight color)
    if canvas.itemcget(objects[index], 'fill') == highlight_color[0]:
        reset()
        return
    # When rightclicking a new point, reset the old selection
    reset()

    # Find coordinates of the selected object
    x_co = data[int(index)][0]
    y_co = data[int(index)][1]

    # Create array for distances to selected object
    dist = []
    # Euclidian distance for every point in the data
    for i in range(len(data)):
        dist.append(
            math.sqrt(math.pow((x_co-data[i][0]), 2)+math.pow((y_co-data[i][1]), 2)))

    # Sort the distances so the shortest are in the front and take take the 1-6 shortest (0 is selected point)
    sorted_dist = sorted(
        range(len(dist)), key=lambda nearest: dist[nearest])[1:6]

   # Change color of selected object to cyan
    canvas.itemconfig(objects[index], fill=highlight_color[0])
    for n in sorted_dist:
       # Change color of neghbors to yellow
        neighbors = objects[int(n)]
        canvas.itemconfig(neighbors, fill=highlight_color[1])


def reset():
    # Set to start color
    for n in objects:
        canvas.itemconfig(n, fill=start_color)

# LEFT CLICK ---------------------------------------


def leftclick(event, index):
    global moved
    # Find coordinates of selected object
    x_co = data[int(index)][0]
    y_co = data[int(index)][1]

    # Check if ibjects have been moved or not
    if moved == False:
        # Move objects
        canvas.move("move_pos", -scale_factor_x * x_co, scale_factor_y * y_co)
        # Quadrant colors
        for i in range(len(data)):
            if data[i][0] < x_co and data[i][1] >= y_co:
                canvas.itemconfig(objects[i], fill=quadrant_color[0])
            if data[i][0] < x_co and data[i][1] < y_co:
                canvas.itemconfig(objects[i], fill=quadrant_color[1])
            if data[i][0] >= x_co and data[i][1] >= y_co:
                canvas.itemconfig(objects[i], fill=quadrant_color[2])
            if data[i][0] >= x_co and data[i][1] < y_co:
                canvas.itemconfig(objects[i], fill=quadrant_color[3])

        # Highlight selected point
        canvas.itemconfig(objects[index], fill="cyan")
        canvas.itemconfig(objects[index], width=2)
        moved = True
    else:  # If it has been moved, reset
        canvas.move("move_pos", scale_factor_x*x_co, -scale_factor_y*y_co)
        canvas.itemconfig(objects[index], width=1)
        for i in range(len(data)):
            canvas.itemconfig(objects[i], fill=start_color)

        moved = False


# Call functions
create_plot()
display_shapes()  # offset is 0 first time
canvas.pack()  # show the canvas

window.mainloop()  # show the window
