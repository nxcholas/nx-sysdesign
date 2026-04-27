# NX-Design — User Guide

## What Is NX-Design?

NX-Design is a visual diagramming tool that lets you map out how a software system works — specifically, **how data moves through it**. Instead of describing your system in words, you place building blocks on a canvas and connect them together. Animated flow bubbles travel along those connections in real time, showing you at a glance where data comes from, where it goes, and how the pieces of your system talk to each other.

You do not need to be a software engineer to use NX-Design. If you can drag and drop, you can build a diagram.

---

## Who Is This For?

NX-Design is useful for:

- **Product managers and business analysts** who need to communicate how a product works without writing code
- **Software engineers** sketching out a new feature or explaining an existing system to teammates
- **Students and learners** studying how modern web applications are structured
- **Anyone** who needs to show — not just tell — how information flows through a digital system

---

## How the Application Works

When you open NX-Design you see three areas:

| Area | What it does |
|---|---|
| **Left panel** | A library of components you can drag onto the canvas |
| **Main canvas** | The large dark grid where you build your diagram |
| **Top bar** | Tabs for switching between diagrams, and save controls |

**The core idea is simple:** drag a component onto the canvas, connect it to another component, and watch the animated dot travel the path you drew. That dot represents data moving through your system.

Every connection you draw is a data path. If you connect a User to a Web Server, the animated bubble shows a request leaving the user and arriving at the server. Chain many components together and you can trace an entire request — from the moment a user clicks a button to the moment data is stored in a database and a response is sent back.

Your diagrams are saved automatically in your browser as you work, so you will not lose anything if you close the tab.

---

## Supported System Design Types

NX-Design covers the building blocks of modern software architecture. Components are grouped into the following categories:

### Clients & Devices
The people and devices that start a request.
- User, Browser, Mobile App, Desktop App, IoT Device, CLI

### Compute & Servers
The machines and services that receive and process requests.
- Web Server, API Gateway, Load Balancer, Container, Lambda / Serverless Function, Virtual Machine, Kubernetes Pod, Microservice, Reverse Proxy, Worker

### Storage & Databases
Where data lives permanently.
- Database, SQL Database, NoSQL Database, Object Storage, File Storage, Data Warehouse, Data Lake, Blob Storage

### Caching
Temporary fast storage that speeds up repeated requests.
- Cache, Redis, CDN (Content Delivery Network), Browser Cache

### Messaging & Events
Systems that pass messages between services without them talking directly.
- Message Queue, Pub/Sub, Event Bus, Stream Processor, Webhook, Notification Service

### Networking & Infrastructure
The plumbing that connects everything.
- Internet, DNS, Firewall, VPC, Subnet, Availability Zone, Region

### Security & Identity
Services that control who can access what.
- Auth Service, WAF (Web Application Firewall), Encryption, Certificate, Secrets Manager, IAM, OAuth

### Monitoring & Observability
Tools that watch your system and report on its health.
- Logging, Metrics, Alerting, Tracing, Health Check, Dashboard

### Data Processing
Services that transform or analyze data at scale.
- ETL Pipeline, Search Engine, Graph Database, Time-Series Database, Data Pipeline

### External Services
Third-party systems your application depends on.
- 3rd Party API, Email Service, SMS Service, Payment Gateway, Analytics, Identity Provider, Cloud Storage

### Entity Relation (Database Schema)
Special table components used to show how a database is structured.
- Table (with rows, primary keys, and relationship lines)

### HTTP Helpers
Small labels you can attach to connections to describe the type of web request or response.
- HTTP Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- Status Codes: 1xx through 5xx groups

---

## Step-by-Step Instructions

### Placing a Component on the Canvas

1. Find the component you want in the **left panel**. Use the search box at the top of the panel if you are not sure which section it is in — just start typing its name.
2. Click and hold the component in the panel.
3. Drag it over to the canvas and release your mouse button.
4. The component appears where you dropped it. You can drag it to a different spot at any time.

> **Tip:** You can also scroll the canvas by holding the **middle mouse button** and dragging, or by holding the **Space bar** while dragging with the left mouse button. Zoom in and out using the **scroll wheel**.

---

### Renaming a Component

1. **Double-click** directly on the component's label (the text below or inside the component).
2. The label text becomes editable — type your new name.
3. Press **Enter** or click anywhere outside the label to save the new name.

---

### Grouping Components into a Container

Containers (called "Frames") let you visually group related components together — for example, everything inside a single server, or all the services in one cloud region.

1. Look at the **toolbar** in the bottom-left corner of the canvas. Click the **frame tool** (the icon that looks like a rectangle with a corner handle).
2. Click and drag on an empty area of the canvas to draw a rectangle. Release when the rectangle covers the area you want.
3. A labeled container appears. Any components already inside the area are automatically grouped into it.
4. To rename the container, double-click its label at the top-left corner and type a new name.
5. To move the container along with everything inside it, drag it from its label bar.
6. To resize the container, drag any of its corner or edge handles.
7. When you drag a new component and drop it inside an existing container, it automatically becomes part of that group.

To switch back to the regular **select tool**, click the arrow icon in the toolbar, or press **Escape**.

---

### Creating a Connection Between Components

Connections are the lines that show data flowing from one component to another.

1. Make sure you are using the **select tool** (the arrow icon in the bottom-left toolbar).
2. Hover your mouse over any component on the canvas. Small **circular dots** will appear around its edges — these are connection ports.
3. Click and hold one of those dots, then drag toward another component.
4. As you drag, a dashed blue line shows the path you are drawing.
5. Release your mouse over the target component. The line snaps into place and an animated bubble immediately begins traveling along it, showing data flow.

To **delete a connection**, click on the line to select it, then press the **Delete** or **Backspace** key on your keyboard. You can also click the red "Remove" button that appears in the top-right corner of the canvas when a connection is selected.

---

### Modifying ERD Connection Cardinality

Cardinality applies to connections between **Entity Relation Table** components. It describes the relationship between two data tables — for example, "one customer can have many orders."

1. First, create two **Table** components (found under **Entity Relation** in the left panel).
2. Connect them by dragging from a row's port on one table to a row's port on the other table (the ports appear on the left and right edges of each row when you hover).
3. Click the connection line between the two tables to select it.
4. A panel appears in the top-right corner of the canvas labeled **Relationship**.
5. Use the **Source end** dropdown to set the cardinality at the starting table.
6. Use the **Target end** dropdown to set the cardinality at the ending table.

**Cardinality options explained in plain language:**

| Option | Meaning |
|---|---|
| None | No relationship marker shown |
| One | Exactly one record on this side |
| Many | Many records on this side |
| One and only one | Exactly one, and it is required |
| Zero or one | Optional — either none or one |
| One or many | At least one, possibly more |
| Zero or many | Optional — none, one, or many |

The cardinality symbols appear as small marks drawn at each end of the connection line.

---

## Other Useful Features

### Multiple Diagrams (Tabs)

You can work on several diagrams at once using tabs in the top bar — similar to browser tabs.

- Click the **+** button in the tab bar to create a new blank diagram.
- Click any tab to switch to it.
- Double-click a tab's name to rename it.
- Click the **×** on a tab to close it.

### Selecting Multiple Components

- Click on empty canvas space and drag to draw a **selection rectangle** around multiple components. All components inside the rectangle become selected at once.
- Press **Delete** or **Backspace** to remove all selected components at the same time.

### Deleting Components

- Click a component to select it (it will highlight with a blue outline).
- Press **Delete** or **Backspace** on your keyboard.
- Alternatively, a **delete button** (trash icon) appears on the component when it is selected — click that instead.

### Resizing Components

- Click a component to select it.
- Small square handles appear on its corners and edges.
- Drag any handle to resize the component.

### Undoing and Redoing Changes

NX-Design keeps a history of your recent edits on each diagram, so you can step back if you make a mistake.

- **Undo** the last change: press **Ctrl+Z** (Windows / Linux) or **Cmd+Z** (Mac).
- The history covers structural edits: adding, moving, resizing, or deleting components and frames; creating or deleting connections; editing ERD table rows and keys; changing cardinality; editing text, text style, shape style, and shape type; and pasting.
- Dragging counts as **one** undo step per drag — undoing after a long drag snaps the component back to where it started, not pixel by pixel.
- Selecting things, panning, zooming, and switching tabs are **not** recorded — undoing will never fight your navigation.
- While you are editing a component's label (the text input is active), Ctrl+Z uses the normal text-edit undo for what you are typing. Once you press Enter or click away, the commit becomes an undoable canvas step.

> **Limitations to be aware of:** history holds the **last 50 changes** per diagram. There is **no redo** — once you undo, that step is gone if you make a new edit on top of it. History is **not saved** — it resets when you reload the page or switch to another diagram.

---

### Copying and Pasting Components

You can duplicate components (and the connections between them) within the same diagram.

1. Select one or more components using click, Shift-click, or a drag selection box.
2. Press **Ctrl+C** (Windows / Linux) or **Cmd+C** (Mac) to copy.
3. Press **Ctrl+V** / **Cmd+V** to paste. Each successive paste is offset slightly so pastes do not stack on top of each other.

Notes:
- Connections between two selected components are copied with them. Connections that leave the selection are not.
- Pasted components arrive unframed, even if the originals were inside a frame — you can drag them into a frame afterward.
- Paste is undoable (Ctrl+Z).

---

### Zooming and Navigating the Canvas

- **Zoom in / out:** Scroll the mouse wheel up or down.
- **Pan (move around):** Hold the middle mouse button and drag, or hold **Space** and drag with the left button, or use the **Pan tool** (hand icon) in the toolbar.
- **Reset zoom:** Click the percentage number in the bottom-right corner of the canvas to return to 100% view.

### Saving Your Work

Your diagrams save automatically in your browser. You can also switch to **manual save** mode using the save toggle in the top-right area of the header — in manual mode, click the save button whenever you want to commit your latest changes.

---

## Frequently Asked Questions

**Can I export my diagram?**
Export functionality is not currently available. Your diagrams are stored in your browser.

**What does the animated dot mean?**
The blue dot that travels along connection lines represents data moving through your system. It is a live visual indicator of the data flow path you have designed.

**What if I accidentally delete something?**
Press **Ctrl+Z** (or **Cmd+Z** on Mac) right away to undo. The last 50 edits on the current diagram are undoable, covering component and frame edits, connections, and text changes. Note that there is no redo yet, and undo history resets when you reload the page or switch tabs, so undo sooner rather than later.

**Do I need an account?**
No account is required to use NX-Design.
