import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { SupportService } from "./support.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { SupportTicketStatus } from "../generated/prisma/client";

describe("SupportService", () => {
  let service: SupportService;
  let prisma: any;
  let notifications: any;

  const mockTicket = {
    id: "ticket-1",
    userId: "user-1",
    categoryId: "cat-1",
    typeId: "type-1",
    title: "Problema no pagamento",
    description: "O PIX não confirmou",
    status: SupportTicketStatus.OPEN,
  };

  const mockFile = (overrides: Partial<Express.Multer.File> = {}) =>
    ({
      fieldname: "images",
      originalname: "foto.png",
      encoding: "7bit",
      mimetype: "image/png",
      size: 1024,
      filename: "uuid.png",
      path: "uploads/support/uuid.png",
      ...overrides,
    }) as Express.Multer.File;

  beforeEach(async () => {
    prisma = {
      supportCategory: { findFirst: jest.fn(), findMany: jest.fn() },
      supportType: { findFirst: jest.fn() },
      supportTicket: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      supportTicketStatusHistory: { create: jest.fn() },
      supportTicketNote: { create: jest.fn() },
      auditLog: { create: jest.fn() },
    };

    notifications = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getCategories", () => {
    it("returns active categories with active types ordered", async () => {
      prisma.supportCategory.findMany.mockResolvedValue([
        { id: "cat-1", types: [] },
      ]);

      const result = await service.getCategories();

      expect(prisma.supportCategory.findMany).toHaveBeenCalledWith({
        where: { active: true, deletedAt: null },
        include: {
          types: { where: { active: true }, orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe("createTicket", () => {
    const dto = {
      categoryId: "cat-1",
      typeId: "type-1",
      title: "Erro ao finalizar compra",
      description: "Não consigo concluir o pedido na tela de checkout.",
    };

    it("creates a ticket with attachments", async () => {
      prisma.supportCategory.findFirst.mockResolvedValue({ id: "cat-1" });
      prisma.supportType.findFirst.mockResolvedValue({ id: "type-1" });
      prisma.supportTicket.create.mockResolvedValue({
        ...mockTicket,
        attachments: [{ url: "/support/files/uuid.png" }],
      });

      const files = { images: [mockFile()] };

      const result = await service.createTicket("user-1", dto, files);

      expect(prisma.supportTicket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          categoryId: "cat-1",
          typeId: "type-1",
          title: dto.title,
          attachments: {
            create: [
              {
                type: "IMAGE",
                fileName: "foto.png",
                mimeType: "image/png",
                size: 1024,
                url: "/support/files/uuid.png",
              },
            ],
          },
        }),
        include: expect.anything(),
      });
      expect(result.attachments).toHaveLength(1);
    });

    it("rejects an invalid category and removes uploaded files", async () => {
      prisma.supportCategory.findFirst.mockResolvedValue(null);

      const files = { images: [mockFile()] };

      await expect(service.createTicket("user-1", dto, files)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.supportTicket.create).not.toHaveBeenCalled();
    });

    it("rejects a type that does not belong to the category", async () => {
      prisma.supportCategory.findFirst.mockResolvedValue({ id: "cat-1" });
      prisma.supportType.findFirst.mockResolvedValue(null);

      await expect(service.createTicket("user-1", dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("rejects files over the field size limit", async () => {
      prisma.supportCategory.findFirst.mockResolvedValue({ id: "cat-1" });
      prisma.supportType.findFirst.mockResolvedValue({ id: "type-1" });

      const files = { images: [mockFile({ size: 6 * 1024 * 1024 })] };

      await expect(service.createTicket("user-1", dto, files)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("sanitizes title and description", async () => {
      prisma.supportCategory.findFirst.mockResolvedValue({ id: "cat-1" });
      prisma.supportType.findFirst.mockResolvedValue({ id: "type-1" });
      prisma.supportTicket.create.mockImplementation(({ data }: any) =>
        Promise.resolve(data),
      );

      const result = await service.createTicket("user-1", {
        ...dto,
        title: "<script>alert(1)</script> Título",
        description: "Texto <b>limpo</b>",
      });

      expect(result.title).toBe("alert(1) Título");
      expect(result.description).toBe("Texto limpo");
    });
  });

  describe("findMyTickets", () => {
    it("returns paginated tickets for the user", async () => {
      prisma.supportTicket.findMany.mockResolvedValue([mockTicket]);
      prisma.supportTicket.count.mockResolvedValue(1);

      const result = await service.findMyTickets("user-1", 1, 10);

      expect(result.meta.total).toBe(1);
      expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1", deletedAt: null },
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe("adminFindAll", () => {
    it("applies combined filters and search", async () => {
      prisma.supportTicket.findMany.mockResolvedValue([]);
      prisma.supportTicket.count.mockResolvedValue(0);

      await service.adminFindAll({
        page: 2,
        limit: 20,
        search: "pix",
        user: "maria",
        categoryId: "cat-1",
        status: SupportTicketStatus.OPEN,
      });

      const where = prisma.supportTicket.findMany.mock.calls[0][0].where;
      expect(where.categoryId).toBe("cat-1");
      expect(where.status).toBe(SupportTicketStatus.OPEN);
      expect(where.OR).toEqual([
        { title: { contains: "pix", mode: "insensitive" } },
        { description: { contains: "pix", mode: "insensitive" } },
        { user: { name: { contains: "maria", mode: "insensitive" } } },
        { user: { email: { contains: "maria", mode: "insensitive" } } },
      ]);
    });
  });

  describe("adminUpdateStatus", () => {
    it("updates the status and records history + audit log", async () => {
      prisma.supportTicket.findFirst.mockResolvedValue(mockTicket);
      prisma.supportTicket.update.mockResolvedValue({
        ...mockTicket,
        status: SupportTicketStatus.IN_PROGRESS,
      });
      prisma.supportTicketStatusHistory.create.mockResolvedValue({});

      const result = await service.adminUpdateStatus(
        "admin-1",
        "ticket-1",
        { status: SupportTicketStatus.IN_PROGRESS, note: "Investigando" },
        { ip: "127.0.0.1", userAgent: "test" },
      );

      expect(result.status).toBe(SupportTicketStatus.IN_PROGRESS);
      expect(prisma.supportTicketStatusHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ticketId: "ticket-1",
          status: SupportTicketStatus.IN_PROGRESS,
          changedBy: "admin-1",
        }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          type: "SUPPORT_RESPONSE",
          title: "Status da reclamação atualizado",
          data: { ticketId: "ticket-1" },
        }),
      );
    });

    it("notifies the user when resolved", async () => {
      prisma.supportTicket.findFirst.mockResolvedValue(mockTicket);
      prisma.supportTicket.update.mockResolvedValue({
        ...mockTicket,
        status: SupportTicketStatus.RESOLVED,
      });

      await service.adminUpdateStatus("admin-1", "ticket-1", {
        status: SupportTicketStatus.RESOLVED,
      });

      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          type: "SUPPORT_RESPONSE",
          data: { ticketId: "ticket-1" },
        }),
      );
    });
  });

  describe("adminAddNote", () => {
    it("creates an internal note", async () => {
      prisma.supportTicket.findFirst.mockResolvedValue(mockTicket);
      prisma.supportTicketNote.create.mockResolvedValue({
        id: "note-1",
        note: "Observação",
      });

      const result = await service.adminAddNote("admin-1", "ticket-1", {
        note: "Observação",
      });

      expect(result.note).toBe("Observação");
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("throws when ticket does not exist", async () => {
      prisma.supportTicket.findFirst.mockResolvedValue(null);

      await expect(
        service.adminAddNote("admin-1", "ticket-1", { note: "x" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("adminRespond", () => {
    it("stores the response and notifies the user", async () => {
      prisma.supportTicket.findFirst.mockResolvedValue(mockTicket);
      prisma.supportTicket.update.mockResolvedValue({
        ...mockTicket,
        adminResponse: "Corrigimos o problema",
        respondedBy: "admin-1",
      });

      const result = await service.adminRespond("admin-1", "ticket-1", {
        response: "Corrigimos o problema",
      });

      expect(result.adminResponse).toBe("Corrigimos o problema");
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          title: "Resposta à sua reclamação",
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
