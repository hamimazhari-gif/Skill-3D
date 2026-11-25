"""Voice-over script PDF. usage: python3 -I tools/vo_pdf.py chapters.json out.pdf
chapters.json: {"title": "...", "subtitle": "...", "chapters": [["Chapter 1 - Title (0:00)", "paragraph"], ...]}"""
import sys, json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
ink = HexColor('#351f22'); d = json.load(open(sys.argv[1], encoding='utf-8'))
T = ParagraphStyle('t', fontName='Helvetica-Bold', fontSize=20, leading=26, textColor=ink, spaceAfter=4)
S = ParagraphStyle('s', fontName='Helvetica', fontSize=10, leading=14, textColor=HexColor('#7a6a6c'), spaceAfter=18)
H = ParagraphStyle('h', fontName='Helvetica-Bold', fontSize=13, leading=18, textColor=ink, spaceBefore=10, spaceAfter=6)
B = ParagraphStyle('b', fontName='Helvetica', fontSize=13, leading=21, textColor=ink)
doc = SimpleDocTemplate(sys.argv[2], pagesize=A4, leftMargin=56, rightMargin=56, topMargin=56, bottomMargin=56, title=d['title'])
st = [Paragraph(d['title'], T), Paragraph(d.get('subtitle', ''), S)]
for h, b in d['chapters']: st += [Paragraph(h, H), Paragraph(b, B), Spacer(1, 8)]
doc.build(st)
